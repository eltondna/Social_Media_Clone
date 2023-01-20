from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from .models import User, Post,Following
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt,csrf_protect
from django.core.paginator import Paginator,PageNotAnInteger,EmptyPage
from django.middleware.csrf import get_token 

@login_required(login_url='/login')
def index(request):
    return render(request, "network/index.html")



@csrf_exempt
def add(request):
        # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    title = data.get("title","")
    content = data.get("content","")
    user = request.user
    creation_date = datetime.now()
    new_post = Post(user=user,title=title,content=content,creation_date=creation_date,like=0)
    new_post.save()
    return JsonResponse({"message": "Post created successfully."}, status=201)


@csrf_exempt
def post(request, section):
    # Main Page 
    if section == "all":
        posts = Post.objects.all()
    
    # Specific User Profile 
    elif section == "following":
        
        user = User.objects.get(username=request.user)
        try:
    # Create a list for the following posts  
            include = []
            f_user = Following.objects.get(user=user)
            following_users = f_user.following_user.all()

    # Add following users posts into the list 
            for each_user in following_users:
                include.append(each_user)
    
            posts = Post.objects.filter(user__in =include).order_by("-creation_date")        
        except Following.DoesNotExist:
            f_user = Following(user=user)
            f_user.save()

    else:
        user = User.objects.get(username=section)
        posts = Post.objects.filter(user=user.id)
    
    posts = posts.order_by("-creation_date")

    # Create Pagination 

    post_per_page = 2
    p = Paginator(posts,post_per_page)
    page_number = request.GET.get('page')
    try:
        page_obj = p.get_page(page_number) 
    except PageNotAnInteger:
        page_obj = p.page(1)
    except EmptyPage:
        page_obj = p.page(p.num_pages)
    return JsonResponse([post.serialize() for post in page_obj.object_list],safe=False)


# Get specific post 
@csrf_exempt
@login_required(login_url='login')
def get_post(request, post_id):
    post = Post.objects.get(id=post_id)
    user = request.user
    if request.method == "GET":
        return JsonResponse(post.serialize())

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("like") is not None:
            post.like = data["like"]
            if data.get("message") == "add":
                post.like_user.add(user)
            else:
                post.like_user.remove(user)
        post.save()
        return JsonResponse(post.serialize(),status=204)
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)








@csrf_exempt
def follow(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get the body data from the fetch data 
    data = json.loads(request.body)
    body_user = data.get("user")
    body_follow_target = data.get("follow_target")
    user = User.objects.get(username=body_user)
    f_user = User.objects.get(username =body_follow_target)    
    
    # Get the User Object in the Following class 
           
    f_object = Following.objects.get(user=user)
    f_object.save() 

    # Request User follow the user 
    f_object.following_user.add(f_user)

    return JsonResponse(f"Follow {f_user.username} successfully!",safe=False)



# Get the number of user "following" 
@csrf_exempt
def following(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    body_user = data.get("user")
    user = User.objects.get(username=body_user)
    
    # Get User Object in the Following classtry:
    try:
        f_user = Following.objects.get(user=user)
    except Following.DoesNotExist:
        f_user = Following(user=user)
        f_user.save()
    # Get the following list of the user 
    following_list = f_user.following_user.all()

    return JsonResponse(len(following_list),safe=False)



#Edit posts
@login_required(login_url='/login')
@csrf_protect
def edit(request,post_id):
    post = Post.objects.get(id=post_id)
    if request.method =="PUT":
        data = json.loads(request.body)
#1. Check validity of the Update
        if request.user != post.user:
            return JsonResponse({"error": "Action Prohibited"},status=400)
#2. Check existence of body content
        if data.get('content') is not None:
            post.content = data["content"]
        post.save()
        return JsonResponse(f"Edit post successfully",safe=False)
    else:
        return JsonResponse({
            "error": "PUT request required."
        },status=400)




def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)

            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
