from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core import serializers

class User(AbstractUser):
    pass



class Post(models.Model):
    id = models.IntegerField(primary_key=True,auto_created=True)
    user = models.ForeignKey(User,models.CASCADE,related_name="addpost_user")
    title = models.CharField(max_length=50,null=True)
    content = models.CharField(max_length=200)
    creation_date = models.DateTimeField()
    like = models.IntegerField()
    like_user = models.ManyToManyField(User,related_name="user_like")
    

    def __str__(self):
        return f"Post {self.id}: User: {self.user} Like: {self.like} creation_date: {self.creation_date}"

    def serialize(self):
        return {
            "id": self.id,
            "Poser": self.user.username,
            "title": self.title,
            "content": self.content,
            "date": self.creation_date.strftime("%b %d %Y, %I:%M %p"),
            "like": self.like,
            "like_user": serializers.serialize("json",self.like_user.all()),
        }


#The users that one user follows
class Following(models.Model):
    user = models.ForeignKey(User,models.CASCADE,related_name="user_following")
    following_user = models.ManyToManyField(User,related_name="followed_by_user")
    




