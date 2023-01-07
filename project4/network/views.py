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
from django.views.decorators.csrf import csrf_exempt


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


def post(request, section):
    # Main Page 
    if section == "all":
        posts = Post.objects.all()
    
    # Specific User Profile 
    else:
        user = User.objects.get(username=section)
        posts = Post.objects.filter(user=user.id)

    posts = posts.order_by("creation_date").all()
    return JsonResponse([post.serialize() for post in posts],safe=False)



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

    # 1. Request User follow the user 
    f_object.following_user.add(f_user)

    # 2. The user is followed by requested user


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
