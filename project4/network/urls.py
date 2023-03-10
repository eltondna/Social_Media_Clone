
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("add",views.add,name="add"),
    path("post/<str:section>/",views.post, name="post"),
    path("follow",views.follow,name="follow"),
    path("following",views.following,name="following"),
    path("edit/<int:post_id>",views.edit,name="edit"),
    path("get_post/<int:post_id>",views.get_post,name="get_post"),
]
