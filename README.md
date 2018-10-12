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

Next, we are going make a small change to our Django `settings.py` file. 

In `backend/backend/settings.py`, remove the value of `DATABASES` and replace it with this: 

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'db',
        'PORT': 5432,
    }
}
```

These settings option tell Django how to connect to the postgres database. Notice that `'HOST': 'db'` refers to the `db` listed under `services` in our `docker-compose.yml` file. Now we are ready to start our two docker containers. This is where docker-compose comes in. The following command will start a Django server and a postgres container where our database will be running and ready to accept connections from our Django application.

### docker-compose best practices

At this point we should talk about best practices with docker compose. `docker-compose.yml` can be tricky to get the hang of at first. There are lots of special values that can change the behavior of how it starts containers, and *where* it looks for certain scripts and files needed to start a container. 

Let's set a `context` value to something other than `.` (the current directory). `context` tells us where to look for the `Dockerfile`. I will try to organize our services by folders in the top level directory, and as a general rule, each top level folder should have it's own Dockerfile or Dockerfiles. 

If we set `context` to `./backend`, then we need to move the Dockerfile to `backend`:

```
$ mv Dockerfile backend/
```

We should move `requirements.txt` to `backend` as well, since it is specific to our `backend` service that runs Django.

```
$ mv requirements.txt backend/
```

Also, before we run the development server (`runserver` command), we will want to make database migrations and run the `migrate` command. We could add this directly to `docker-compse.yml`, but this would clutter the file. We will be adding lots to this, so it is better to keep this file clean. 

Instead of writing:

```yml
command: python3 manage.py makemigrations && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8000
```

we can replace these chained commands with one shell script:

```yml
command: /start.sh
```

**start.sh**

```bash
#!/bin/bash

cd backend
python3 manage.py makemigrations
python3 manage.py migrate --no-input
python3 manage.py runserver 0.0.0.0:8000
```

We also need to make `start.sh` executable:

```bash
$ sudo chmod +x start.sh
```

Next, we need to move this file to our `backend`. Since we will probably be adding additional scripts to this folder for other functionality, let's create a `scripts` folder and move `start.sh` into that folder. 

```
.
├── backend
│   ├── backend
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   └── scripts
│       └── start.sh
├── docker-compose.yml
└── README.md

3 directories, 10 files
```

Next, we need to copy the script into the top level of our Docker container so it has access to the script. To do this, we can add the following line to the `backend` `Dockerfile`:

```
FROM python:3.6 
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
COPY scripts/start.sh /
ADD . /code/
```

We added this line: `COPY scripts/start.sh /`. Since our `context` was set to `backend` in `docker-compose.yml`, we will have access to `scripts/start.sh` in the Docker container when it starts up. Now that we have carefully moved all of our files into place, we are ready to user `docker-compse up`. This command does nothing more than running multiple containers as specified by the `docker-compose.yml` file. Actually, it takes care of two other important docker concept: `networks` and `volumes`--we will get to these soon.

By default, `docker-compose up` looks for a file named `docker-compose.yml` in the same directory that it uses to start containers.

At this point, if we run `docker-compose up`, we get an error.

```
$ docker-compose up
portal_db_1 is up-to-date
Creating portal_web_1 ... error

ERROR: for portal_web_1  Cannot start service web: OCI runtime create failed: container_linux.go:348: startingcontainer process caused "exec: \"/start.sh\": stat /start.sh: no such file or directory": unknown

ERROR: for web  Cannot start service web: OCI runtime create failed: container_linux.go:348: starting container process caused "exec: \"/start.sh\": stat /start.sh: no such file or directory": unknown
ERROR: Encountered errors while bringing up the project.
```

Since we changed the Dockerfile, we need to rebuild the docker container so that it includes our `start.sh` script, so we simple run the command with `--build`:

```
$ docker-compose up --build
Creating network "portal_default" with the default driver
Building web
Step 1/8 : FROM python:3.6
 ---> 0c4b4dbe1e58
Step 2/8 : ENV PYTHONUNBUFFERED 1
 ---> Using cache
 ---> 8ad1f5d92a16
Step 3/8 : RUN mkdir /code
 ---> Using cache
 ---> 1a69a4a0d9c2
Step 4/8 : WORKDIR /code
 ---> Using cache
 ---> 6ba28dd645f4
Step 5/8 : ADD requirements.txt /code/
 ---> Using cache
 ---> e5a958a4e669
Step 6/8 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> 3ea3049488af
Step 7/8 : COPY scripts/start.sh /
 ---> Using cache
 ---> f2a3a578f135
Step 8/8 : ADD . /code/
 ---> Using cache
 ---> 2598309c4c69
Successfully built 2598309c4c69
Successfully tagged portal_web:latest
Recreating portal_db_1 ... done
Recreating portal_web_1 ... done
Attaching to portal_db_1, portal_web_1
db_1   | 2018-10-11 23:54:21.401 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
db_1   | 2018-10-11 23:54:21.401 UTC [1] LOG:  listening on IPv6 address "::", port 5432
db_1   | 2018-10-11 23:54:21.408 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
db_1   | 2018-10-11 23:54:21.446 UTC [25] LOG:  database system was shut down at 2018-10-11 23:54:18 UTC
db_1   | 2018-10-11 23:54:21.454 UTC [1] LOG:  database system is ready to accept connections
web_1  | /usr/local/lib/python3.6/site-packages/psycopg2/__init__.py:144: UserWarning: The psycopg2 wheel package will be renamed from release 2.8; in order to keep installing from binary please use "pip install psycopg2-binary" instead. For details see: <http://initd.org/psycopg/docs/install.html#binary-install-from-pypi>.
web_1  |   """)
web_1  | No changes detected
web_1  | /usr/local/lib/python3.6/site-packages/psycopg2/__init__.py:144: UserWarning: The psycopg2 wheel package will be renamed from release 2.8; in order to keep installing from binary please use "pip install psycopg2-binary" instead. For details see: <http://initd.org/psycopg/docs/install.html#binary-install-from-pypi>.
web_1  |   """)
web_1  | Operations to perform:
web_1  |   Apply all migrations: admin, auth, contenttypes, sessions
web_1  | Running migrations:
web_1  |   No migrations to apply.
web_1  | /usr/local/lib/python3.6/site-packages/psycopg2/__init__.py:144: UserWarning: The psycopg2 wheel package will be renamed from release 2.8; in order to keep installing from binary please use "pip install psycopg2-binary" instead. For details see: <http://initd.org/psycopg/docs/install.html#binary-install-from-pypi>.
web_1  |   """)
web_1  | /usr/local/lib/python3.6/site-packages/psycopg2/__init__.py:144: UserWarning: The psycopg2 wheel package will be renamed from release 2.8; in order to keep installing from binary please use "pip install psycopg2-binary" instead. For details see: <http://initd.org/psycopg/docs/install.html#binary-install-from-pypi>.
web_1  |   """)
web_1  | Performing system checks...
web_1  | 
web_1  | System check identified no issues (0 silenced).
web_1  | October 11, 2018 - 23:54:22
web_1  | Django version 2.1.2, using settings 'backend.settings'
web_1  | Starting development server at http://0.0.0.0:8000/
web_1  | Quit the server with CONTROL-C.
```

If you run `git status`, you will see some additional `.pyc` files generated by docker. Let's add a `.gitignore` file to keep these out of our source control:

**.gitignore**

```
__pycache__/
```

You might have noticed that there are several errors in the `web_1` output related to `psycopg2`, the Python package that helps us work with Postgres databases. Let's add `psycopg2-binary` to our `requirements.txt` file in order to get rid of this message. We can get rid of the `psycopg2` package and add the `psycopg2-binary` package in its place.

```
$ docker-compose up --build
Building web
Step 1/8 : FROM python:3.6
 ---> 0c4b4dbe1e58
Step 2/8 : ENV PYTHONUNBUFFERED 1 ---> Using cache ---> 8ad1f5d92a16
Step 3/8 : RUN mkdir /code
 ---> Using cache ---> 1a69a4a0d9c2Step 4/8 : WORKDIR /code
 ---> Using cache
 ---> 6ba28dd645f4
Step 5/8 : ADD requirements.txt /code/
 ---> 1748c46dd9ff
Step 6/8 : RUN pip install -r requirements.txt
 ---> Running in 2dfe4414a858
Collecting Django (from -r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/32/ab/22530cc1b2114e6067eece94a333d6c749fa1c56a009f0721e51c181ea53/Django-2.1.2-py3-none-any.whl (7.3MB)
Collecting psycopg2-binary (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/3f/4e/b9a5cb7c7451029f67f93426cbb5f5bebedc3f9a8b0a470de7d0d7883602/psycopg2_binary-2.7.5-cp36-cp36m-manylinux1_x86_64.whl (2.7MB)
Collecting pytz (from Django->-r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/30/4e/27c34b62430286c6d59177a0842ed90dc789ce5d1ed740887653b898779a/pytz-2018.5-py2.py3-none-any.whl (510kB)
Installing collected packages: pytz, Django, psycopg2-binary
Successfully installed Django-2.1.2 psycopg2-binary-2.7.5 pytz-2018.5
Removing intermediate container 2dfe4414a858
 ---> b51cf06f0ad6
Step 7/8 : COPY scripts/start.sh /
 ---> a25ed75c1a84
Step 8/8 : ADD . /code/
 ---> bd3c2782c9c9
Successfully built bd3c2782c9c9
Successfully tagged portal_web:latest
Starting portal_db_1 ... done
Recreating portal_web_1 ... done
Attaching to portal_db_1, portal_web_1
db_1   | 2018-10-12 00:06:38.906 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
db_1   | 2018-10-12 00:06:38.906 UTC [1] LOG:  listening on IPv6 address "::", port 5432
db_1   | 2018-10-12 00:06:38.916 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
db_1   | 2018-10-12 00:06:38.933 UTC [24] LOG:  database system was shut down at 2018-10-12 00:06:19 UTC
db_1   | 2018-10-12 00:06:38.938 UTC [1] LOG:  database system is ready to accept connections
web_1  | No changes detected
web_1  | Operations to perform:
web_1  |   Apply all migrations: admin, auth, contenttypes, sessions
web_1  | Running migrations:
web_1  |   No migrations to apply.
web_1  | Performing system checks...
web_1  |
web_1  | System check identified no issues (0 silenced).
web_1  | October 12, 2018 - 00:06:40
web_1  | Django version 2.1.2, using settings 'backend.settings'
web_1  | Starting development server at http://0.0.0.0:8000/
web_1  | Quit the server with CONTROL-C.
```

Notice that the warnings about `psycopg2` are gone. 

Now, let's visit `http://0.0.0.0:8000/` to see our dockerized Django app in action. We see an error:

> Invalid HTTP_HOST header: '0.0.0.0:8000'. You may need to add '0.0.0.0' to ALLOWED_HOSTS.

Let's set a value for `ALLOWED_HOSTS` in `settings.py`:

```python

ALLOWED_HOSTS = ['*']

```

Now, notice that we don't need to rebuild our containers. Simply save `settings.py` with the new `ALLOWED_HOSTS` value, and we will be able to access our application. 

This brings us to the concept of volumes. You might not have noticed, but our `docker-compose.yml` file uses a volume:

```yml
    volumes:
      - .:/code
```

This mounts our backend folder into the `/code` directory inside of our container. Let's demonstrate this by learning another helpful trick when working with containers: shelling into a running container. 

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                   NAMES
4bfe8f88161b        portal_web          "/start.sh"              10 minutes ago      Up 5 minutes        0.0.0.0:8000->8000/tcp   portal_web_1
95d3e821164d        postgres            "docker-entrypoint.s…"   23 minutes ago      Up 5 minutes        5432/tcp                 portal_db_1
```

Now, if we take the `CONTAINER ID` of `portal_web`, the Django container, we can access this container with the following command: 

```
$ docker exec -it 4bfe8f88161b /bin/bash
root@4bfe8f88161b:/code#
```

We can see that we are in the `/code` directory. Let's see what files we have here:

```
root@4bfe8f88161b:/code# ls -al
total 48
drwxrwxr-x 4 1000 1000  4096 Oct 12 00:00 .
drwxr-xr-x 1 root root  4096 Oct 12 00:06 ..
drwxrwxr-x 8 1000 1000  4096 Oct 12 00:20 .git
-rw-rw-r-- 1 1000 1000    12 Oct 12 00:00 .gitignore
-rw-rw-r-- 1 1000 1000 23757 Oct 12 00:20 README.md
drwxr-xr-x 4 1000 1000  4096 Oct 11 23:07 backend
-rw-rw-r-- 1 1000 1000   188 Oct 11 23:54 docker-compose.yml
```

We are inside of our container in a folder called `/code`, a top level folder, and it contains our entire project directory. 

This is why our `start.sh` script first changes directory to `backend` before running the `runserver` command.

We could rearrange this if we wanted so that we are only mounting our `backend` into the volume. This depends on what code you need access to on a per-container basis. This is also why `docker-compose.yml` lives in the root of our project and the various docker files for containers can live elsewhere. 

Since the code was mounted from our local machine into the container, the changes we make on the files in our local machine are also made inside of the container, so our Django app refreshes when we save our code. 

While we are in the container, let's create a superuser that we can use to login to Django admin.

## Django ReST Framework

At this point, we are going to add some additional packages to Django that will allow us to build a powerful API. The [Django ReST Framework](https://www.django-rest-framework.org/) will be responsible for serializing and deserializing our Django models instances to and from JSON. It has many powerful fetures that make it the most popular package for building APIs with Django. 

In addition to the Django ReST Framework, we will install another package for using JSON Web Tokens for authentication and permission control. This package is called [`djangorestframework_jwt`](https://github.com/GetBlimp/django-rest-framework-jwt) and it is maintained by a company called [Blimp](https://github.com/GetBlimp). 

First let's add the packages to the end of `requirements.txt`:

```python
djangorestframework
django-filter
djangorestframework-jwt
```

Next, we will need to add the following to `INSTALLED_APPS`:

```python

    'rest_framework',

```

Then we can add the following to `settings.py` after `DATABASES`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}
```

We have a little bit more work to do on the backend. Once we build out an authentiction system and a basic model like "Blog Posts", we will be ready to set up a front end that will get and post data to our backend Django API. Then we will tie the backend and the frontend together with a powerful webserver and reverse proxy: NGINX.

First, we need a new Django app to organize our project users. Let's create a new app called `accounts`. We will need to issue a `startapp` command from inside of our Django container, change permissions on those files, and then add the name of the app to `INSTALLED_APPS` so our project becomes aware of it. We will also need to create API endpoints. Let's do this all step-by-step.

First, let's make the app:

```
$ docker exec -it portal_web_1 /bin/bash
root@559e1087027f:/code# cd backend/
root@559e1087027f:/code/backend# ./manage.py startapp accounts
root@559e1087027f:/code/backend#
```

Set permissions on the files in the `accounts` app: 

```
$ sudo chown -R $USER:$USER .
[sudo] password for brian:
$
```

Now let's hook up our `accounts` app to the rest of our Django project. Add `'accounts'` to `INSTALLED_APPS` and add the following to the `urls.py` file in `backend`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('accounts.urls')),
    path('admin/', admin.site.urls),
]
```

Add `urls.py` to `accounts` and add the following: 

Now, to the `urls.py` file in the `accounts` app, add the following: 

```python
from django.urls import path, re_path
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token, verify_jwt_token

urlpatterns = [
    re_path(r'^auth/obtain_token/', obtain_jwt_token, name='api-jwt-auth'),
    re_path(r'^auth/refresh_token/', refresh_jwt_token, name='api-jwt-refresh'),
    re_path(r'^auth/verify_token/', verify_jwt_token, name='api-jwt-verify'),
]
```

The first route will return a JSON response containing a special token when we send a POST request with the correct `username` and `password`. Actually, `djangorestframework_jwt` supports `AbstractBaseUser`, so we should be able to authenticate with any combination of credentials, but we will only be looking at the standard user model for now. 

Let's write a test to see how this works in action. In `accounts/tests.py`, write the following:

```python
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


from django.contrib.auth.models import User

class AccountsTests(APITestCase):

    def test_obtain_jwt(self):

        # create an inactive user
        url = reverse('api-jwt-auth')
        u = User.objects.create_user(username='user', email='user@foo.com', password='pass')
        u.is_active = False
        u.save()

        # authenticate with username and password
        resp = self.client.post(url, {'email':'user@foo.com', 'password':'pass'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        
        # set the user to activate and attempt to get a token from login
        u.is_active = True
        u.save()
        resp = self.client.post(url, {'username':'user', 'password':'pass'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in resp.data)
        token = resp.data['token']

        # print the token
        print(token)
```

We can run this test like this: 

```
$ docker exec -it portal_web_1 /bin/bash
root@559e1087027f:/code# cd backend/
root@559e1087027f:/code/backend# ./manage.py test
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InVzZXIiLCJleHAiOjE1MzkzMTE4ODAsImVtYWlsIjoidXNlckBmb28uY29tIn0.cPO-FOEqEdQh05Y2UpU7ec3OlSX16kU8EvkgtlcdU58
.
----------------------------------------------------------------------
Ran 1 test in 0.177s

OK
Destroying test database for alias 'default'...
root@559e1087027f:/code/backend#
```

Our test passes, and we can see the JWT printed out at the end of the test. Here's a JWT, decoded:

```json
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNTM4MzMwNTk5LCJlbWFpbCI6IiJ9.rIHFjBmbqBHnqKwCNlHenImMtQSmzFkbGLA8pddQ6AY
```

and then decode it using base64:


```json
{"typ":"JWT","alg":"HS256"}{"user_id":2,"username":"admin","exp":1538330599,"email":""}Ō稬6QޜY<P
```

The first part of JSON identifies the type of token and the hashing algorithm used. The second part is a JSON representation of the authenticated user, with additional information about when the token expires. The third part is a signature that uses the `SECRET_KEY` of our Django application for security.

We can also try this enpoint in the Django ReST Framework's browseable API by going to `http://0.0.0.0:8000/auth/obtain_token/`. You will see this:

```
HTTP 405 Method Not Allowed
Allow: POST, OPTIONS
Content-Type: application/json
Vary: Accept

{
    "detail": "Method \"GET\" not allowed."
}
```

This makes sense, because this endpoint only accepts POST requests. From the browseable API, we can make a POST request using our superuser account. 

Let's pause here and commit our work.

Now that we have a working user authentication system, let's create a simple "Blog Post" model in a new app called `posts`. I'm going to borrow code from [this Django Rest Framework tutorial](https://wsvincent.com/django-rest-framework-tutorial/). 

Create a `posts` app in our Django project through `docker exec` as we did before, add `posts` to `INSTALLED_APPS`, and link up the urls in `backend` with: 

```python
urlpatterns = [
  ...
  path('api/', include('posts.urls')),
]
```

Now we can add the model: 

```python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

Next let's register this app with the Django admin: 

```python
from django.contrib import admin
from . models import Post

admin.site.register(Post)
```

Then add a serializer for this model by creating `serializers.py` in the `posts` folder: 

```python
from rest_framework import serializers
from . import models


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        fields = ('id', 'title', 'content', 'created_at', 'updated_at',)
        model = models.Post

```

We will need to add `urls.py` to `posts` with the following: 

```python
from django.urls import path

from . import views

urlpatterns = [
    path('', views.PostList.as_view()),
    path('<int:pk>/', views.PostDetail.as_view()),
]
```

Finally, we will add two views that we mapped to endpoints in the code above:

```python
from rest_framework import generics

from .models import Post
from .serializers import PostSerializer


class PostList(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class PostDetail(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

Now, let's add some Post objects in the Django admin. 

Go back to the browsable api and visit `/api/posts/`. You should see the posts you created in admin. Now let's have a look at something. Earlier we set `REST_FRAMEWORK` in `settings.py`. Let's see what this does by removing session and basic authentication:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
}
```

Before we start working on our frontend, let's write some tests to make sure that access to our posts is limited to requests that come with a valid token. 

**posts/tests.py**

```python
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from rest_framework import status

from rest_framework_jwt.settings import api_settings


class TestPosts(TestCase):
    """Post Tests"""

    def test_get_posts(self):
        """
        Unauthenticated users should not be able to access posts via APIListView
        """
        url = reverse('posts')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_header_for_token_verification(self):
        """
        https://stackoverflow.com/questions/47576635/django-rest-framework-jwt-unit-test
        Tests that users can access posts with JWT tokens
        """

        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        user = User.objects.create_user(username='user', email='user@foo.com', password='pass')
        user.is_active = True
        user.save()
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)


        verify_url = reverse('api-jwt-verify')
        credentials = {
            'token': token
        }

        resp = self.client.post(verify_url, credentials, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
```

You will see that you are logged out of the browsable API, and when you try to access the posts list, you will see the following:

```
HTTP 401 Unauthorized
Allow: GET, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept
WWW-Authenticate: JWT realm="api"

{
    "detail": "Authentication credentials were not provided."
}
```

We need to think about what default behavior we should set so that we don't have to repeat entering the same permission or authentication class for each view. 

Since the only way we can authenticate is with JSON web tokens, we should now think about adding our frontend. This will allow us to make POST requests to the backend's authentication route from our frontin login form, save returned tokens in state and in local storage, and also send the token as a header with each outgoing request that can be used to grant permission for protected resources. We will get to this soon, but first we need to build our frontend. 

At this point, we can say that the very basics of our backend app are complete. We can obtain tokens for accessing protected resources. Currently, we can't do much with these tokens other than incorporate them into our tests. Let's commit our changes and merge our `djangoapp` branch into our `develop` branch. 