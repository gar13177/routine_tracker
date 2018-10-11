# README

## High-level overview

This project shows how to use docker-compose to orchestrate multiple containerized services including:

- Django
- nginx
- VueJS
- Postgres
- Redis
- RabbitMQ
- Celery workers

Each step of the process will be described in detail with links to relevant documentation and resources used in putting together this architecture. This project uses official documentation recommendations whenever possible. Outside of the software mentioned in this tutorial, no other sotware or packages are required to get started. We will be using `Ubuntu 16.04`. 

## GitLab Repo Setup

Create a new GitLab repository. Here we are using a repository called `portal` owned by `bcaffey`:

```bash
$ git init
Initialized empty Git repository in /home/brian/gitlab/portal/.git/
$ git remote add origin git@gitlab.com-work:bcaffey/portal.git
$ echo "# README" > README.md
$ git add .
$ git commit -m "initial commit"
[master (root-commit) 5e78190] initial commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
 $ git push -u origin master
Counting objects: 3, done.
Writing objects: 100% (3/3), 224 bytes | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To git@gitlab.com-work:bcaffey/portal.git
 * [new branch]      master -> master
Branch master set up to track remote branch master from origin.
$
```

## SSH Config

*Note*: For multiple GitLab accounts, make sure to configure `~/.ssh/config` so that a unique key is used to push code to each account. Notice in the command above we used `git@gitlab.com-work:bcaffey/portal.git`. Our `~/.ssh/config` will tell us to use the `~/.ssh/gitlab` key when pushing to this repo. This is needed because we can't use the same key for more than one identity on GitLab. We set the `Host` in the config file below to match the name of the host in the remote we added (`git@gitlab.com-work`). 

**`~/.ssh/config`**
```
#gitlab personal
Host gitlab.com-personal
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_rsa


#gitlab work 
Host gitlab.com-work
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/gitlab
```

The host can be anything, it just needs to be unique so that we can use different ssh keys.

## Docker

Follow instructions for installing the community edition of docker on Ubuntu. This can be found [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

After you have installed docker, follow the [post-installation steps for linux](https://docs.docker.com/install/linux/linux-postinstall/). This will prevent us from having to use `sudo` when running docker commands.

Finally, install `docker-compose` by following the Linux instructions found [here](https://docs.docker.com/compose/install/#install-compose). 

Make sure that docker is correctly configured on your machine by running the following command:

```
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
d1725b59e92d: Pull complete 
Digest: sha256:0add3ace90ecb4adbf7777e9aacf18357296e799f81cabc9fde470971e499788
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/

```

If you have used docker previously, you may want to remove any old or unused images. Do this with the following commands: 

```bash
$ docker rmi $(docker images -f "dangling=true" -q)
$ docker system prune
$ docker rmi $(docker images -a -q)
```

## Git

This project will try to adhere to git practices described [here](https://nvie.com/posts/a-successful-git-branching-model/). 

Let's commit the README.md file

Let's start with creating a `develop` branch, and then add a dockerized Django application as our first feature. 

```
$ git branch develop
$ git checkout -b djangoapp develop
$ git branch
  develop
* djangoapp
  master
```

Following along with the docker example, let's add `Dockerfile`, `docker-compose.yml` and `requirements.txt`:

**Dockerfile**

```
FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/
```
**requirements.txt**

```
Django
psycopg2
```

**docker-compose.yml**

```yml
version: '3'

services:
  db:
    image: postgres
  web:
    build: .
    command: python3 manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    depends_on:
      - db
```

So far, this is our file structure: 

```
.
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt

0 directories, 4 files
```

Next, let's start our Django project. We don't want to install Django on our local machine, that's not the docker way. Instead we should run the `startproject` command from inside a docker container. Here's how we can accomplish this: 

```bash
sudo docker-compose run web django-admin.py startproject backend
```

This will create the Django project in a new folder called `backend`. We don't want to include the `.` at the end of the command, because this will place several different files from our Django app in the top level folder. This will help keep things clean as we add more to our application later. 

Here's what we should see when the command finishes: 

```
$ sudo docker-compose run web django-admin.py startproject backend
[sudo] password for brian: 
Creating network "portal_default" with the default driver
Pulling db (postgres:)...
latest: Pulling from library/postgres
802b00ed6f79: Pull complete
4e0de21e2180: Pull complete
58b06ac4cd84: Pull complete
14e76b354b47: Pull complete
0f0c9f244b65: Pull complete
37117d8abb6d: Pull complete
8b541f5d818a: Pull complete
7cb4855fcd96: Pull complete
5c7fe264586b: Pull complete
64568a495c35: Pull complete
283257efa745: Pull complete
222b134fa51d: Pull complete
e9a30e7f2a9f: Pull complete
86bffc7855b0: Pull complete
Digest: sha256:1d26fae6c056760ed5aa5bb5d65d155848f48046ae8cd95c5b26ea7ceabb37ad
Status: Downloaded newer image for postgres:latest
Creating portal_db_1 ... done
Building web
Step 1/7 : FROM python:3.6
3.6: Pulling from library/python
05d1a5232b46: Pull complete
5cee356eda6b: Pull complete
89d3385f0fd3: Pull complete
80ae6b477848: Pull complete
28bdf9e584cc: Pull complete
dec1a1f0462b: Pull complete
a4670d125615: Pull complete
547b45a875f5: Pull complete
ee15e3195a8d: Pull complete
Digest: sha256:54b8aeb1516d7c180d92b47f9f89641926be05a0469b1376195d6bb4eba383f4
Status: Downloaded newer image for python:3.6
 ---> 0c4b4dbe1e58
Step 2/7 : ENV PYTHONUNBUFFERED 1
 ---> Running in 96822fd5189c
Removing intermediate container 96822fd5189c
 ---> 9daa32a28c22
Step 3/7 : RUN mkdir /code
 ---> Running in 109f42ee9f10
Removing intermediate container 109f42ee9f10
 ---> 7a3ca99b002c
Step 4/7 : WORKDIR /code
 ---> Running in 1e480fec8fe2
Removing intermediate container 1e480fec8fe2
 ---> 79c18b8b0715
Step 5/7 : ADD requirements.txt /code/
 ---> 4219d5d70003
Step 6/7 : RUN pip install -r requirements.txt
 ---> Running in 22e250ccc1f3
Collecting Django (from -r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/32/ab/22530cc1b2114e6067eece94a333d6c749fa1c56a009f0721e51c181ea53/Django-2.1.2-py3-none-any.whl (7.3MB)
Collecting psycopg2 (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/5e/d0/9e2b3ed43001ebed45caf56d5bb9d44ed3ebd68e12b87845bfa7bcd46250/psycopg2-2.7.5-cp36-cp36m-manylinux1_x86_64.whl (2.7MB)
Collecting pytz (from Django->-r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/30/4e/27c34b62430286c6d59177a0842ed90dc789ce5d1ed740887653b898779a/pytz-2018.5-py2.py3-none-any.whl (510kB)
Installing collected packages: pytz, Django, psycopg2
Successfully installed Django-2.1.2 psycopg2-2.7.5 pytz-2018.5
Removing intermediate container 22e250ccc1f3
 ---> 48accfb85181
Step 7/7 : ADD . /code/
 ---> 2982d3d16063
Successfully built 2982d3d16063
Successfully tagged portal_web:latest
WARNING: Image for service web was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
```

Also, let's check our files:

```
.
├── backend
│   ├── backend
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── manage.py
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt

```

Finally, let's list the files and folders in our top directory:

```
$ ls -al
total 40
drwxrwxr-x 4 brian brian 4096 Oct 11 18:35 .
drwxrwxr-x 3 brian brian 4096 Oct 11 16:32 ..
drwxr-xr-x 3 root  root  4096 Oct 11 18:35 backend
-rw-rw-r-- 1 brian brian  210 Oct 11 18:26 docker-compose.yml
-rw-rw-r-- 1 brian brian  145 Oct 11 18:18 Dockerfile
drwxrwxr-x 8 brian brian 4096 Oct 11 18:37 .git
-rw-rw-r-- 1 brian brian 9292 Oct 11 18:37 README.md
-rw-rw-r-- 1 brian brian   15 Oct 11 18:18 requirements.txt
```

Notice that the backend folder is owned by `root`. This is because we are part of the docker group, and docker runs everything as root. 

Let's change permissions on all of our files with the following command: 

```bash
$ sudo chown -R $USER:$USER .
```

Now let's check on the files in the `backend` directory:

```
$ cd backend && ls -al
total 16
drwxr-xr-x 3 brian brian 4096 Oct 11 18:35 .
drwxrwxr-x 4 brian brian 4096 Oct 11 18:35 ..
drwxr-xr-x 2 brian brian 4096 Oct 11 18:35 backend
-rwxr-xr-x 1 brian brian  539 Oct 11 18:35 manage.py
```

Nothing is owned by root, which is what we want. 

Let's review the changes we made with `git status`:

```
$ git status
On branch djangoapp
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	Dockerfile
	backend/
	docker-compose.yml
	requirements.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

Let's add the changes and commit them to our `djangoapp` branch. 

```
$ git add . && git commit -m "created django project and docker files, updated README"
```