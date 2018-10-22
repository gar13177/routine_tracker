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
$ docker system prune
$ docker rmi $(docker images -f "dangling=true" -q)
$ docker rmi $(docker images -a -q)
$ docker rm $(docker ps --filter=status=exited --filter=status=created -q)
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

We added this line: `COPY scripts/start.sh /`. Since our `context` was set to `backend` in `docker-compose.yml`, we will have access to `scripts/start.sh` in the Docker container when it starts up. Now that we have carefully moved all of our files into place, we are ready to user `docker-compose up`. This command does nothing more than running multiple containers as specified by the `docker-compose.yml` file. Actually, it takes care of two other important docker concept: `networks` and `volumes`--we will get to these soon.

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

```
$ git commit -m "added post model and tests for users accessing posts"
$ git checkout develop
$ git merge djangoapp
```

# Frontend

Now we are ready to build our frontend. First, let's create a feature branch called `vueapp` that we will branch off of our current `develop` branch. 

```
$ git checkout -b vueapp develop

$ git lg2
* 47f05c9 - Fri, 12 Oct 2018 09:43:24 -0400 (9 minutes ago) (HEAD -> vueapp, djangoapp, develop)
|           added post model and tests for users accessing posts - Brian Caffey
* 1719e71 - Thu, 11 Oct 2018 23:09:48 -0400 (11 hours ago)
|           added accounts app and set up authentication routes - Brian Caffey
* 41d6e38 - Thu, 11 Oct 2018 18:46:28 -0400 (15 hours ago)
|           created django project and docker files, updated README - Brian Caffey
* 5e78190 - Thu, 11 Oct 2018 16:34:45 -0400 (17 hours ago) (origin/master, master)
            initial commit - Brian Caffey
```

Let's create a toplevel folder called `frontend` that will contain our Vue app. Instead of running `mkdir frontend`, we want to have this folder and its files be generated by docker. We need a container with node

Let's start with a `Dockerfile` in our toplevel folder. This file will only have one line: 

```
FROM node:9.11.1-alpine
```

Next, we will run the following command: 

```
$ docker run --rm -it -v /home/brian/gitlab/portal/frontend/:/code node:9.11.1-alpine /bin/sh
```

This command will start the container with the node image, and it will share our `frontend` folder with a new folder we are creating in the container called `/code`. Once we are inside of the container, we can install the following packages with `npm` (which is already installed since we are using `node:9.11.1-alpine` as our base image for this container):

- vue
- @vue/cli

From inside the container, run the following commands:

```
# cd code
# npm i -g vue @vue/cli
# vue create .
```

This will bring us into the `/code` directory (which is shared with `frontend` on our local machine--it is essentially the directory). 

We then install packages with npm globally, and run a command to create a new VueJS project using a command line tool. Here are the settings I will choose for this project:

- Manually select features
- Babel
- PWA
- Router
- Vuex
- Linter / Formatter
- Unit Testing
- E2E Testing
- History Mode (Y)
- AirBnb styling
- npm (package manager)

Now we have a new VueJS project on our local machine. Before we do anything, we should change the permissions of the files that were just created, because the were created by docker and therefore belong to the `root` user. 

```
$ sudo chown -R $USER:$USER .
```

We are now almost ready to start developing our Vue app. But before we do that, we need to talk about environments. 

A VueJS app is nothing more than a `collection of static files`. However, when we develop our VueJS app, we will be working with `.vue` files that take advantage of modern Javascript features (ES6). When we run `npm run build`, the `.vue` files and other files are bundled into a `collection of static files` that are delivered to the browser, so they don't include `.vue` files, only `.html`, `.js` and `.css` files.

We will want to take advantage of hot-reloading. This is a feature of modern Javascript frameworks that allows us to view our app as we develop it. This means that we can make changes to `.vue` files, and then we will be able to see changes instantly in a browser that is showing us a preview. This "preview" is started by running `npm run serve`. This is the mode that we will use as we develop our app. It is not using the `collection of static files` that we will use in production. 

Since docker is all about maintaining the same environment between development, testing, staging/QA and prodcution, we need to be careful when we start introducing different environments. It wouldn't be practical to run `npm run build` after every change we made while developing our app--this command takes some time to generate the `collection of static files`. 

What this means is that we will ultimately need two different versions of our existing `docker-compose.yml` file: 

1. One that serves a `collection of static files` for production, and 
2. One that offers us hot reloading during our development process. 

We will also be able to use verion `1` during local development, but our changes won't be reflected immediately. We'll see all of this in action in a minute. 

Before we split our `docker-compose.yml`, let's commit our changes. One more, thing, we can remove the Dockerfile that we used to create our container that we used to create the Vue app files. 

```
$ rm Dockerfile
$ git add .
$ git commit -m "added VueJS project in frontend"
```

## `docker-compose.dev.yml`

Since we will be splitting out our `docker-compose.yml` file into a development and production verion (and even more versions later on), let's copy it into `docker-comppse.dev.yml`:

```
$ cp docker-compose.yml docker-compose.dev.yml
```

Our `docker-compose.dev.yml` file currently has two services in it: `db` and `backend`. `db` is the service that runs our Postgres database, and `backend` is the service that runs our Django application. We will need to introduce two new services: `frontend` and `nginx`. Also, we will introduce two [networks](https://docs.docker.com/network/) that will help our service communicate automatically through the docker engine. 

### Networks

There are several types of networks that docker supports, but we will use one called "user-defined bridge networks". 

> User-defined bridge networks are best when you need multiple containers to communicate on the same Docker host. We will add these to `docker-compose.dev.yml` after we add the `frontend` and `nginx` services. 

### `frontend`

`frontend` will use a `node` base image and it will run `npm run serve` so that we can watch for changes to files in our project and see the result instantly. 

Here's what the service will look like in `docker-compose.dev.yml`:

```yml
  frontend:
    build:
      context: ./frontend
    volumes:
      - ./frontend:/app/frontend:ro
    networks:
      - nginx_network
    depends_on:
      - backend
      - db
```

For this service, we will be looking for a `Dockerfile` in `frontend`. We know this from the `build/context` part of the service definition:

```yml
    build:
      context: ./frontend
```

Let's create this `Dockerfile`, and then continue looking at the `frontend` service in `docker-compose.dev.yml`. 

### `frontend` Dockerfile

```
FROM node:9.11.1-alpine

# make the 'app' folder the current working directory
WORKDIR /app/

COPY package.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

WORKDIR /app/frontend

EXPOSE 8080

CMD ["npm", "run", "serve"]
```

This Dockerfile says: 

- Use the base image of `node:9.11.1-alpine`,
- In the container, create a folder in the root of the filesystem called `/app` and move into this directory
- Copy `package.json` from our local machine into `/app` (not `/`) in the container,
- Install the dependencies into `node_modules`,
- Copy over all of the files from our project to `.`, which is `/app` since we set that as `WORKDIR`,
- Change into the folder `/app/frontend`,
- Expose port `8080` in our container
- Run `npm run serve` in the container

Let's continue looking at `docker-compose.dev.yml`. After the `build` section, we see that we are mounting the `frontend` directory from our local machine into `/app/frontend`. `ro` specifies that the mounted volume is read-only. This is fine since we will be editing the files in this volume from our local machine, not from inside of the docker container. 

Next, we see that the service definition for `frontend` lists `nginx_network` under networks. This means that the service shares a network with other services that are also on `nginx_network`. We will see why this is the case soon. 

`depends_on` lists the services that must be started before the services `depends_on` is listed under starts. 

Now let's look at NGINX. NGINX is a webserver and reverse proxy that will play an important role in our application. NGINX is analogous to the "front desk" in that it directs traffic to the files or service URLs that specifies. If you are familiar with Django's URL routing, I think it is fair to say that NGINX is like a higher-level version of `urls.py` in that it directs traffic based on the properties of the incoming URLs.

```yml
  nginx:
    image: nginx:alpine
    ports:
      - "8000:80"
    depends_on:
      - backend
    volumes:
      - ./nginx/dev.conf:/etc/nginx/nginx.conf:ro
    networks:
      - nginx_network
      - backend_network
```

In this service we don't include `build` in the definition because we aren't modifying the base image, `nginx:alpine` in this case. Because we are not modifying it, we can simply include `nginx:alpine`. Since we aren't specifying a URL, the docker engine defaults to `docker.io` to look for these images. `docker.io` is a private company that maintains a registry of base images that can be used for literally anything. Have a look at the Docker (big D) Hub to see what kinds of things people and companies are doing with docker. 

Next we specify ports. We want to map port `8000` on our local machine to port `80` of this container. This means that when we type `localhost:8000` on our local machine, our requests goes to port `80` of the NGINX container which will be listening on this port, and accordingly directing traffic to the destination specified in its configuration file. 

Next we see that `dev.conf` is mounted to `/etc/nginx/nginx.conf`. Let's talk about this after we talk about networks.

We see that this port is on the `nginx_network` and the `backend_network`. This is important because we will be making requests to both the `backend` API Django service which is on the `backend_network` and also the `frontend` service that will make request to the `nginx_network`, the service that is running our development server for VueJS on node. 

> The network configuration will change slightly for production, we will see how when we return to `docker-compose.yml`.

Let's come back to the volumes. This section of the service definition says that `nginx/dev.conf` will be mounted to `/etc/nginx/nginx.conf`. What this is doing is allowing us to place our NGINX configuration file inside of the container in a file that NGINX usually looks to for its configuration (`/etc/nginx/nginx.conf`).

Now that we are done analyzing the NGINX service definition, let's look at `nginx.dev.conf`. This is the NGINX configuration file that we will use for our development environment. But first, let's create this folder and file:

```
$ mkdir nginx && cat <<EOF > nginx/dev.conf
user  nginx;
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include /etc/nginx/mime.types;
  client_max_body_size 100m;

  upstream backend {
    server backend:8000;
  }

  upstream frontend {
    server frontend:8080;
  }


  server {
    listen 80;
    charset utf-8;

    # frontend urls
    location / {
    proxy_redirect off;
    proxy_pass http://frontend;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    }

    # frontend dev-server
    location /sockjs-node {
      proxy_redirect off;
      proxy_pass http://frontend;
      proxy_set_header X-Real-IP  $remote_addr;
      proxy_set_header X-Forwarded-For $remote_addr;
      proxy_set_header Host $host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    # backend urls
    location ~ ^/(admin|api) {
      proxy_redirect off;
      proxy_pass http://backend;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
    }

    # backend static
    location ~ ^/(staticfiles|media)/(.*)$ {
      alias /$1/$2;
    }
  }
}
EOF
```

Now let's look at this NGINX configuration file in detail. Inside of `http`, we first define "aliases" for `backend` and `frontend`. NGINX calls these `upstream`:

```
  upstream backend {
    server backend:8000;
  }

  upstream frontend {
    server frontend:8080;
  }
```

> Notice how this file references both `frontend:8080` and `backend:8000`. This is why the `nginx` service needs to be on the `frontend` and `backend` network. Also notice that we are listening on port `80` with `listen 80;`.

[Here](https://stackoverflow.com/a/5238430/6084948) is a helpful explination of how NGINX handles multiple `location` blocks.

Also, [here](https://stackoverflow.com/questions/40516288/webpack-dev-server-with-nginx-proxy-pass) is an explination of the `sockjs-node` block. 

At this point, we should test to see if everything is working. This step is difficult because there are several moving parts that must be implemented at the same time. 

Let's run our new `docker-compose.dev.yml` file with the following command. 

```
$ docker-compose -f docker-compose.dev.yml up --build
```

This command will fail, here's why: we allocated port `8000` in `backend`, and try to allocated it again in `nginx`. Let's remove the `ports` entry from the `backend` service definition. 

Run the command again, and verify that the services are working: 

```
$$ docker-compose -f docker-compose.dev.yml up --buildCreating network "portal_backend_network" with driver "bridge"Creating network "portal_nginx_network" with driver "bridge"Pulling db (postgres:)...latest: Pulling from library/postgres802b00ed6f79: Pulling fs layer4e0de21e2180: Pulling fs layer58b06ac4cd84: Pull complete14e76b354b47: Pull complete0f0c9f244b65: Pull complete37117d8abb6d: Pull complete8b541f5d818a: Pull complete
7cb4855fcd96: Pull complete
5c7fe264586b: Pull complete
64568a495c35: Pull complete
283257efa745: Pull complete
222b134fa51d: Pull complete
e9a30e7f2a9f: Pull complete
86bffc7855b0: Pull complete
Digest: sha256:1d26fae6c056760ed5aa5bb5d65d155848f48046ae8cd95c5b26ea7ceabb37ad
Status: Downloaded newer image for postgres:latest
Building backend
Step 1/8 : FROM python:3.6
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
Step 2/8 : ENV PYTHONUNBUFFERED 1
 ---> Running in 608fe05dcc82
Removing intermediate container 608fe05dcc82
 ---> d79c95aece63
Step 3/8 : RUN mkdir /code
 ---> Running in 17a4d19192a7
Removing intermediate container 17a4d19192a7
 ---> 87ecfebca470
Step 4/8 : WORKDIR /code
 ---> Running in e92f775a386e
Removing intermediate container e92f775a386e
 ---> 31a35b0ba399
Step 5/8 : ADD requirements.txt /code/
 ---> b3fce352848f
Step 6/8 : RUN pip install -r requirements.txt
 ---> Running in d4afb0085559
Collecting Django (from -r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/32/ab/22530cc1b2114e6067eece94a333d6c749fa1c56a009f0721e51c181ea53/Django-2.1.2-py3-none-any.whl (7.3MB)
Collecting psycopg2-binary (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/3f/4e/b9a5cb7c7451029f67f93426cbb5f5bebedc3f9a8b0a470de7d0d7883602/psycopg2_binary-2.7.5-cp36-cp36m-manylinux1_x86_64.whl (2.7MB)
Collecting djangorestframework (from -r requirements.txt (line 4))
  Downloading https://files.pythonhosted.org/packages/90/30/ad1148098ff0c375df2a30cc4494ed953cf7551fc1ecec30fc951c712d20/djangorestframework-3.8.2-py2.py3-none-any.whl (923kB)
Collecting django-filter (from -r requirements.txt (line 5))
  Downloading https://files.pythonhosted.org/packages/6a/8b/8517167a0adc45ce94d0873efb9487dd4cdeff7e10f96e837ad3d58f5837/django_filter-2.0.0-py3-none-any.whl (69kB)
Collecting djangorestframework-jwt (from -r requirements.txt (line 6))
  Downloading https://files.pythonhosted.org/packages/2b/cf/b3932ad3261d6332284152a00c3e3a275a653692d318acc6b2e9cf6a1ce3/djangorestframework_jwt-1.11.0-py2.py3-none-any.whl
Collecting pytz (from Django->-r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/30/4e/27c34b62430286c6d59177a0842ed90dc789ce5d1ed740887653b898779a/pytz-2018.5-py2.py3-none-any.whl (510kB)
Collecting PyJWT<2.0.0,>=1.5.2 (from djangorestframework-jwt->-r requirements.txt (line 6))
  Downloading https://files.pythonhosted.org/packages/93/d1/3378cc8184a6524dc92993090ee8b4c03847c567e298305d6cf86987e005/PyJWT-1.6.4-py2.py3-none-any.whl
Installing collected packages: pytz, Django, psycopg2-binary, djangorestframework, django-filter, PyJWT, djangorestframework-jwt
Successfully installed Django-2.1.2 PyJWT-1.6.4 django-filter-2.0.0 djangorestframework-3.8.2 djangorestframework-jwt-1.11.0 psycopg2-binary-2.7.5 pytz-2018.5
Removing intermediate container d4afb0085559
 ---> d0d43b3ab10a
Step 7/8 : COPY scripts/start.sh /
 ---> e5a950ddb972
Step 8/8 : ADD . /code/
 ---> 8e85fdff8433
Successfully built 8e85fdff8433
Successfully tagged portal_backend:latest
Building frontend
Step 1/8 : FROM node:9.11.1-alpine
 ---> 9cc7800b3f3c
Step 2/8 : WORKDIR /app/
 ---> Running in c554a51aa77f
Removing intermediate container c554a51aa77f
 ---> 749d196ed9a4
Step 3/8 : COPY package.json ./
 ---> 7e66c006d87d
Step 4/8 : RUN npm install
 ---> Running in 53826745963c
npm WARN deprecated bfj-node4@5.3.1: Switch to the `bfj` package for fixes and new features!
npm WARN notice [SECURITY] debug has the following vulnerability: 1 low. Gohere for more details: https://nodesecurity.io/advisories?search=debug&version=2.2.0 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.
npm WARN deprecated @types/commander@2.12.2: This is a stub types definition for commander (https://github.com/tj/commander.js). commander provides itsown type definitions, so you don't need @types/commander installed!
npm WARN deprecated socks@1.1.10: If using 2.x branch, please upgrade to atleast 2.1.6 to avoid a serious bug with socket data flow and an import issue introduced in 2.1.0
npm WARN notice [SECURITY] https-proxy-agent has the following vulnerability: 1 high. Go here for more details: https://nodesecurity.io/advisories?search=https-proxy-agent&version=1.0.0 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.
npm WARN notice [SECURITY] http-proxy-agent has the following vulnerability: 1 high. Go here for more details: https://nodesecurity.io/advisories?search=http-proxy-agent&version=1.0.0 - Run `npm i npm@latest -g` to upgrade yournpm version, and then `npm audit` to get more info.
npm WARN notice [SECURITY] growl has the following vulnerability: 1 critical. Go here for more details: https://nodesecurity.io/advisories?search=growl&version=1.9.2 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.
npm WARN babel-loader@8.0.4 requires a peer of @babel/core@^7.0.0 but none is installed. You must install peer dependencies yourself.

npm ERR! code EINTEGRITY
npm ERR! sha512-+CCi1ED+7f36xpeGUqB8bWHde0To+9ZtegBHwWkbd9NsZcvANrtr8wlRNqHSD8yGmC0F7rixbgwiJEK9mTCLww== integrity checksum failed when using sha512: wanted sha512-+CCi1ED+7f36xpeGUqB8bWHde0To+9ZtegBHwWkbd9NsZcvANrtr8wlRNqHSD8yGmC0F7rixbgwiJEK9mTCLww== but got sha512-41ZwfFdpGbCcncIHnk74WFkpJESr2efWu0ttkWaYlmu1Xa8e1FFREvuOW8pocOVEeV6p6QOesM6LZYKlSajeFw==. (20654717 bytes)

npm ERR! A complete log of this run can be found in:
npm ERR!     /root/.npm/_logs/2018-10-13T00_57_13_197Z-debug.log
ERROR: Service 'frontend' failed to build: The command '/bin/sh -c npm install' returned a non-zero code: 1
brian@brian-ThinkPad-X1-Carbon-6th:~/gitlab/portal$ docker-compose -f docker-compose.dev.yml up --build
Building backend
Step 1/8 : FROM python:3.6
 ---> 0c4b4dbe1e58
Step 2/8 : ENV PYTHONUNBUFFERED 1
 ---> Using cache
 ---> d79c95aece63
Step 3/8 : RUN mkdir /code
 ---> Using cache
 ---> 87ecfebca470
Step 4/8 : WORKDIR /code
 ---> Using cache
 ---> 31a35b0ba399
Step 5/8 : ADD requirements.txt /code/
 ---> Using cache
 ---> b3fce352848f
Step 6/8 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> d0d43b3ab10a
Step 7/8 : COPY scripts/start.sh /
 ---> Using cache
 ---> e5a950ddb972
Step 8/8 : ADD . /code/
 ---> Using cache
 ---> 8e85fdff8433
Successfully built 8e85fdff8433
Successfully tagged portal_backend:latest
Building frontend
Step 1/8 : FROM node:9.11.1-alpine
 ---> 9cc7800b3f3c
Step 2/8 : WORKDIR /app/
 ---> Using cache
 ---> 749d196ed9a4
Step 3/8 : COPY package.json ./
 ---> Using cache
 ---> 7e66c006d87d
Step 4/8 : RUN npm install
 ---> Running in e17978369eb9
npm WARN deprecated bfj-node4@5.3.1: Switch to the `bfj` package for fixes and new features!
npm WARN deprecated @types/commander@2.12.2: This is a stub types definition for commander (https://github.com/tj/commander.js). commander provides itsown type definitions, so you don't need @types/commander installed!
npm WARN notice [SECURITY] debug has the following vulnerability: 1 low. Gohere for more details: https://nodesecurity.io/advisories?search=debug&version=2.2.0 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.
npm WARN deprecated socks@1.1.10: If using 2.x branch, please upgrade to atleast 2.1.6 to avoid a serious bug with socket data flow and an import issue introduced in 2.1.0
npm WARN notice [SECURITY] https-proxy-agent has the following vulnerability: 1 high. Go here for more details: https://nodesecurity.io/advisories?search=https-proxy-agent&version=1.0.0 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.
npm WARN notice [SECURITY] http-proxy-agent has the following vulnerability: 1 high. Go here for more details: https://nodesecurity.io/advisories?search=http-proxy-agent&version=1.0.0 - Run `npm i npm@latest -g` to upgrade yournpm version, and then `npm audit` to get more info.
npm WARN notice [SECURITY] growl has the following vulnerability: 1 critical. Go here for more details: https://nodesecurity.io/advisories?search=growl&version=1.9.2 - Run `npm i npm@latest -g` to upgrade your npm version, and then `npm audit` to get more info.

> chromedriver@2.42.0 install /app/node_modules/chromedriver
> node install.js

Downloading https://chromedriver.storage.googleapis.com/2.42/chromedriver_linux64.zip
Saving to /app/node_modules/chromedriver/chromedriver/chromedriver_linux64.zip
Received 781K...
Received 1571K...
Received 2355K...
Received 3139K...
Received 3923K...
Received 3944K total.
Extracting zip contents
Copying to target path /app/node_modules/chromedriver/lib/chromedriver
Fixing file permissions
Done. ChromeDriver binary available at /app/node_modules/chromedriver/lib/chromedriver/chromedriver

> yorkie@2.0.0 install /app/node_modules/yorkie
> node bin/install.js

setting up Git hooks
can't find .git directory, skipping Git hooks installation
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN babel-loader@8.0.4 requires a peer of @babel/core@^7.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.4 (node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.4: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

added 1679 packages in 43.09s
Removing intermediate container e17978369eb9
 ---> 8c0e715c1bc5
Step 5/8 : COPY . .
 ---> f9cb2e9de63e
Step 6/8 : WORKDIR /app/frontend
 ---> Running in 87a17185ef71
Removing intermediate container 87a17185ef71
 ---> e95bd3cadf5f
Step 7/8 : EXPOSE 8080
 ---> Running in ec21b4cfa54c
Removing intermediate container ec21b4cfa54c
 ---> 7d20d8a9f74e
Step 8/8 : CMD ["npm", "run", "serve"]
 ---> Running in 03008f43b31b
Removing intermediate container 03008f43b31b
 ---> d94fbade9e49
Successfully built d94fbade9e49
Successfully tagged portal_frontend:latest
Pulling nginx (nginx:alpine)...
alpine: Pulling from library/nginx
4fe2ade4980c: Pull complete
c3f09dfaf47d: Pull complete
83283d0e9bb9: Pull complete
e2e530da9538: Pull complete
Digest: sha256:ae5da813f8ad7fa785d7668f0b018ecc8c3a87331527a61d83b3b5e816a0f03c
Status: Downloaded newer image for nginx:alpine
Creating portal_db_1 ... done
Creating portal_backend_1 ... done
Creating portal_nginx_1    ... error
Creating portal_frontend_1 ...

ERROR: for portal_nginx_1  Cannot start service nginx: driver failed programming external connectivity on endpoint portal_nginx_1 (85267b60eb70e9389b24a864c2ebde3d0b99ba5b414c0cde147d86e19aa0dee0): Bind for 0.0.0.0:8000 failed:Creating portal_frontend_1 ... done

ERROR: for nginx  Cannot start service nginx: driver failed programming external connectivity on endpoint portal_nginx_1 (85267b60eb70e9389b24a864c2ebde3d0b99ba5b414c0cde147d86e19aa0dee0): Bind for 0.0.0.0:8000 failed: port is already allocated
ERROR: Encountered errors while bringing up the project.
brian@brian-ThinkPad-X1-Carbon-6th:~/gitlab/portal$ docker-compose -f docker-compose.dev.yml up --build
Building backend
Step 1/8 : FROM python:3.6
 ---> 0c4b4dbe1e58
Step 2/8 : ENV PYTHONUNBUFFERED 1
 ---> Using cache
 ---> d79c95aece63
Step 3/8 : RUN mkdir /code
 ---> Using cache
 ---> 87ecfebca470
Step 4/8 : WORKDIR /code
 ---> Using cache
 ---> 31a35b0ba399
Step 5/8 : ADD requirements.txt /code/
 ---> Using cache
 ---> b3fce352848f
Step 6/8 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> d0d43b3ab10a
Step 7/8 : COPY scripts/start.sh /
 ---> Using cache
 ---> e5a950ddb972
Step 8/8 : ADD . /code/
 ---> 3b5037e242de
Successfully built 3b5037e242de
Successfully tagged portal_backend:latest
Building frontend
Step 1/8 : FROM node:9.11.1-alpine
 ---> 9cc7800b3f3c
Step 2/8 : WORKDIR /app/
 ---> Using cache
 ---> 749d196ed9a4
Step 3/8 : COPY package.json ./
 ---> Using cache
 ---> 7e66c006d87d
Step 4/8 : RUN npm install
 ---> Using cache
 ---> 8c0e715c1bc5
Step 5/8 : COPY . .
 ---> Using cache
 ---> f9cb2e9de63e
Step 6/8 : WORKDIR /app/frontend
 ---> Using cache
 ---> e95bd3cadf5f
Step 7/8 : EXPOSE 8080
 ---> Using cache
 ---> 7d20d8a9f74e
Step 8/8 : CMD ["npm", "run", "serve"]
 ---> Using cache
 ---> d94fbade9e49
Successfully built d94fbade9e49
Successfully tagged portal_frontend:latest
portal_db_1 is up-to-date
Recreating portal_backend_1 ... done
Recreating portal_nginx_1    ... done
Recreating portal_frontend_1 ... done
Attaching to portal_db_1, portal_backend_1, portal_frontend_1, portal_nginx_1
backend_1   | No changes detected
db_1        | The files belonging to this database system will be owned by user "postgres".
db_1        | This user must also own the server process.
db_1        |
db_1        | The database cluster will be initialized with locale "en_US.utf8".
db_1        | The default database encoding has accordingly been set to "UTF8".
db_1        | The default text search configuration will be set to "english".
db_1        |
db_1        | Data page checksums are disabled.
db_1        |
db_1        | fixing permissions on existing directory /var/lib/postgresql/data ... ok
db_1        | creating subdirectories ... ok
db_1        | selecting default max_connections ... 100
db_1        | selecting default shared_buffers ... 128MB
db_1        | selecting dynamic shared memory implementation ... posix
db_1        | creating configuration files ... ok
db_1        | running bootstrap script ... ok
db_1        | performing post-bootstrap initialization ... ok
db_1        |
db_1        | WARNING: enabling "trust" authentication for local connections
db_1        | You can change this by editing pg_hba.conf or using the option -A, or
db_1        | --auth-local and --auth-host, the next time you run initdb.
db_1        | syncing data to disk ... ok
db_1        |
db_1        | Success. You can now start the database server using:
db_1        |
db_1        |     pg_ctl -D /var/lib/postgresql/data -l logfile start
db_1        |
db_1        | ****************************************************
db_1        | WARNING: No password has been set for the database.
db_1        |          This will allow anyone with access to the
db_1        |          Postgres port to access your database. In
db_1        |          Docker's default configuration, this is
db_1        |          effectively any other container on the same
db_1        |          system.
db_1        |
db_1        |          Use "-e POSTGRES_PASSWORD=password" to set
db_1        |          it in "docker run".
db_1        | ****************************************************
db_1        | waiting for server to start....2018-10-13 01:01:00.616 UTC [45] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
db_1        | 2018-10-13 01:01:00.633 UTC [46] LOG:  database system was shut down at 2018-10-13 01:01:00 UTC
db_1        | 2018-10-13 01:01:00.638 UTC [45] LOG:  database system is ready to accept connections
db_1        |  done
db_1        | server started
db_1        |
db_1        | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
db_1        |
db_1        | waiting for server to shut down...2018-10-13 01:01:00.707 UTC[45] LOG:  received fast shutdown request
db_1        | .2018-10-13 01:01:00.712 UTC [45] LOG:  aborting any active transactions
db_1        | 2018-10-13 01:01:00.713 UTC [45] LOG:  worker process: logical replication launcher (PID 52) exited with exit code 1
db_1        | 2018-10-13 01:01:00.713 UTC [47] LOG:  shutting down
db_1        | 2018-10-13 01:01:00.753 UTC [45] LOG:  database system is shut down
db_1        |  done
db_1        | server stopped
db_1        |
db_1        | PostgreSQL init process complete; ready for start up.
db_1        |
db_1        | 2018-10-13 01:01:00.818 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
db_1        | 2018-10-13 01:01:00.818 UTC [1] LOG:  listening on IPv6 address "::", port 5432
db_1        | 2018-10-13 01:01:00.825 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
db_1        | 2018-10-13 01:01:00.874 UTC [54] LOG:  database system was shut down at 2018-10-13 01:01:00 UTC
db_1        | 2018-10-13 01:01:00.879 UTC [1] LOG:  database system is ready to accept connections
backend_1   | Operations to perform:
backend_1   |   Apply all migrations: admin, auth, contenttypes, posts, sessions
frontend_1  |
frontend_1  | > code@0.1.0 serve /app/frontend
frontend_1  | > vue-cli-service serve
frontend_1  |
frontend_1  |  INFO  Starting development server...
backend_1   | Running migrations:
backend_1   |   No migrations to apply.
backend_1   | Performing system checks...
backend_1   |
backend_1   | System check identified no issues (0 silenced).
backend_1   | October 13, 2018 - 01:03:48
backend_1   | Django version 2.1.2, using settings 'backend.settings'
backend_1   | Starting development server at http://0.0.0.0:8000/
backend_1   | Quit the server with CONTROL-C.

...

frontend_1  |

frontend_1  |   App running at:
frontend_1  |   - Local:   http://localhost:8080/
frontend_1  |
frontend_1  |   It seems you are running Vue CLI inside a container.
frontend_1  |   Access the dev server via http://localhost:<your container's external mapped port>/
frontend_1  |
frontend_1  |   Note that the development build is not optimized.
frontend_1  |   To create a production build, run npm run build.
frontend_1  |

```

This will build our four containers: 

- `db`
- `backend`
- `frontend`
- `nginx`

It will also configure the networks that we mentioded eariler. 

Notice that `frontend` acknowledges that we are running Vue CLI inside a container. 

It's important to pay attention to the `ports` in our networked containers at this time as this could possibly be a little confusing. 

We see that the Djnago app is listening on `localhost:8000`. However, if we go to this address, we will see a response in the terminal running `docker-compose` show activity from NGINX: 

```
nginx_1     | 172.18.0.1 - - [13/Oct/2018:01:11:20 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
nginx_1     | 172.18.0.1 - - [13/Oct/2018:01:11:20 +0000] "GET /sockjs-node/561/jphm10su/websocket HTTP/1.1" 101 258 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
...
```

We now have a working frontend, and a working backend. However, these services are not yet talking to eachother. Let's connect our backend with our frontend by displaying `posts` from our Django API on a new page in our VueJS app. 

At this point, all of our hard work in setting up our local development server will start to pay off. Why? Because we will now be able to edit our VueJS and Django appliction source code and we will see changes reflected in both applications immediately without having to restart our docker containers. 

*Note*: this is our **development environemnt**. It will not be suitable for a production environment. Could it be used in a production environment? Probably. We can test that later. 

For now, let's focus on connecting our backend and frontend. First, let's add the following to our VueJS app:

*routes.js*

```javascript
    {
      path: '/posts',
      name: 'posts',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "posts" */ './views/Posts.vue'),
    },
```

*App.vue*

```html
      <router-link to="/">Home</router-link> |
      <router-link to="/posts">Posts</router-link> |
      <router-link to="/about">About</router-link>
```

*Posts.vue

```html
<template>
  <div>
    <div v-for="(post, i) in posts" :key="i">
      <h1 :key="i">{{ post.title }}</h1>
      <p :key="i">{{ post.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [],
    };
  },
  mounted() {
    this.fetchPosts();
    document.title = 'Posts';
  },
  methods: {
    fetchPosts() {
      fetch('http://localhost:8000/api/posts/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((json) => {
              this.posts = json;
            });
          }
        });
    },
  },
};
</script>

<style scoped>
  h1 {
    color: green;
  }
  p {
    color: blue;
  }
</style>
```

We don't see any posts. Let's take a look in the Chrome Developer Console:

```
VM2475:1 GET http://localhost:8000/api/posts/ 401 (Unauthorized)
Posts.vue?3dcd:21 
Promise {<resolved>: {…}}
__proto__: Promise
[[PromiseStatus]]: "resolved"
[[PromiseValue]]: Object
detail: "Authentication credentials were not provided."
__proto__: Object
```

This is what we expect. Here we are getting a response from the server saying that we are unauthorized to access the requested resources. 

We have two options for the next step:

1. We could implement an authenticatoin system that will obtain a token and pass the token in the header of all subsequent requests. 

2. We could change the permissions for the post model so that any user can access `/api/posts/`.

Let's take option `2` for now and revisit authentication soon. 

All we have to do is change `REST_FRAMEWORK` in our settings:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        # 'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        # 'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework.authentication.BasicAuthentication',
    ),
}
```

Now that we have commented out all permission and authentication classes, we should be able to see our Posts in our VueJS frontend.

If you haven't already done so, make sure that you have some posts in your database. You can check the posts you have by navigating to `localhost:8000/api/posts/`.

You probably don't see any static files in the browsable API. Let's fix this by adding `python3 manage.py collectstatic` to the container's `command` phase:

*start.sh*

```bash
#!/bin/bash

cd backend
python3 manage.py collectstatic --no-input
python3 manage.py makemigrations
python3 manage.py migrate --no-input
python3 manage.py runserver 0.0.0.0:8000
```

You may see the following error:

```
django.core.exceptions.ImproperlyConfigured: You're using the staticfiles app without having set the STATIC_ROOT setting to a filesystem path.
```

Let's add the following to the bottom of `settings.py`:

```python
STATIC_ROOT = 'static'
```

Also, let's create a `.gitignore` file and put `static` in it:

```
$ echo "static" > backend/.gitignore
```

We also need to add the following `location` block to our NGINX configuration:

```
    location /static {
      proxy_pass http://backend;
    }
```

Let's restart docker-compose with the `--build` option:

```
$ docker-compose -f docker-compose.dev.yml up --build
```

We will also need to create a superuser. A nice shortcut for shelling into a container uses the Docker extension for Visual Studio Code. Go to Docker > Containers. Right click on the container you want to use and then select `Attach shell` and you will open up an interactive shell:

```
$ docker exec -it dc3d96b0faea959d4d4c6dc030a74fbe6349529f4d63281c26b0337bc3542a27 /bin/sh
# cd backend
# ./manage.py createsuperuser
/code/backend
Username (leave blank to use 'root'): admin
Email address:
Password:
Password (again):
This password is too common.
Bypass password validation and create user anyway? [y/N]: y
Superuser created successfully.
```

Great, now we should be able to see our posts displayed from our VueJS app. 

Let's commit this work and then setup our production `docker-compose` with nginx and our frontend.

```
 git status
On branch vueapp
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   README.md
        modified:   backend/backend/settings.py
        modified:   backend/scripts/start.sh
        modified:   frontend/src/App.vue
        modified:   frontend/src/router.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        backend/.gitignore
        docker-compose.dev.yml
        frontend/Dockerfile
        frontend/src/views/Posts.vue
        nginx/

no changes added to commit (use "git add" and/or "git commit -a")
$ git add .
$ git commit -m "completed development environemnt: added nginx, connected frontend and backend, fixed static files"
```

## Production development environment

We finished setting up `docker-compose.dev.yml`. We will run `docker-compse` with this file as we develop our app. To start development, all we have to do is run:

```
$ docker-compose -f docker-compose.dev.yml up
```

When we make any changes to our docker-compose or Dockerfiles, or the scripts and commands used to start our docker containers, we will need to add the `--build` flag. If we forget to add the build flag after editing a docker-related file, the docker engine will use the cached version of our containers. 

```
$ docker-compose -f docker-compose.dev.yml up --build
```

This will tell the docker engine to look for any changes and rebuild the layers that have been changed. This is one of docker's best features. 

However, when we run this application in production, we don't want to be using `npm run serve`, we also don't want to be using Django's `runserver` command; this command is not designed for production (Django is a framework for building web applications, not a webserver). Instead, we will serve a `collection of static files` that is optimized for production. This `collection of static files` is generated with `npm run build` and it lives in the `dist` folder in `frontend`. And for Django, we will replace `runserver` with [**gunicorn**](https://gunicorn.org/). 

Let's go back to `docker-compose.yml` and think about what we need. First, we don't need the `frontend` service that we added to `docker-compose.dev.yml`. We will need NGINX, but in our NGING config file for production we won't need to listen for `/sockjs-node`. 

To clarify, we will need to edit our existing `docker-compose.yml` for production, and we will also need to create a new file called `prod.conf` to replace `dev.conf` in our production environment. Let's look at `docker-compose.yml` first, and then `prod.conf`, and finally we will create a `Dockerfile` that combines building a `collection of static files` (which will be our production VueJS app) with running our NGINX container.

**docker-compose.yml**

```yml
version: '3'

services:
  backend:
    build:
      context: ./backend
    command: /start.sh
    volumes:
      - .:/code
    depends_on:
      - db
    networks:
      - nginx_network
      - backend_network

  db:
    image: postgres
    networks: 
      - backend_network

  nginx:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    ports:
      - 8000:80
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks: 
      - nginx_network
      - backend_network

networks:
  nginx_network:
    driver: bridge
  backend_network:
    driver: bridge
```

Notice two things:

1. We don't define a `frontend` service in the docker-compose file. Also, we mount a different configuration file for the NGINX service. Let's take a look at this file, `prod.conf`:

2. An important differences between our `docker-compose.dev.yml` file and this `docker-compose.yml` file: 

**docker-compose.dev.yml**

```yml
  nginx:
    image: nginx:alpine
```

**docker-compose.yml**

```yml
  nginx:
    build:
      context: ./nginx
```

This means we are using a custom `Dockerfile` for our production environment and a base image `nginx:alpine` for our development environemt. We will take a look at this Dockerfile after we look at the NGINX configuration file: 

**prod.conf**

```
user  nginx;
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include /etc/nginx/mime.types;
  client_max_body_size 100m;

  upstream backend {
    server backend:8000;
  }

  server {
    listen 80;
    charset utf-8;

    root /dist/;
    index index.html;

    # frontend
    location / {
      try_files $uri $uri/ @rewrites;
    }

    location @rewrites {
      rewrite ^(.+)$ /index.html last;
    }

    # backend urls
    location ~ ^/(admin|api) {
      proxy_redirect off;
      proxy_pass http://backend;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
    }

    # backend static
    location ~ ^/(staticfiles|media)/(.*)$ {
      alias /$1/$2;
    }

    # Some basic cache-control for static files to be sent to the browser
    location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
      expires max;
      add_header Pragma public;
      add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
  }
}
```

In this NGINX configuration file, we direct traffic to our Django container for `admin` and `api` requests (or any other request that we wish to define manually), and all other traffic is routed to `index.html` where our VueJS app takes over routing (such as with the `/posts` route that we defined earlier). 

Now let's have a look at the `Dockerfile` for our NGINX service. We use an interesting technique that is documented [here](https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html) in VueJS documentation for dockering VueJS applications called a `multi-stage build process`:

**nginx/Dockerfile**

```
# build stage
FROM node:9.11.1-alpine as build-stage
WORKDIR /app/
COPY frontend/package.json /app/
RUN npm install
COPY frontend /app/
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY nginx/prod.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /dist/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

The `build stage` section of this Dockerfile is responsible for building our `collection of static files` that we will serve in production. The `production stage` takes the `collection of static files` (that was generated with `npm run build`) from `/app/dist` of our `build stage` and copies this directory into the `/dist` folder of our NGINX container where they are served by NGINX. This multi-stage build process helps us maintain smaller layers which results in smaller images. 

Now let's run our production `docker-compose` file to test it out:

```
$ docker-compose up --build
```

Everything should be working now. This is our production environment, so and changes to our VueJS app will not be reflected in our browser because we are serving files from our `collection of static files`, we are not running `npm run serve` like we do in `docker-compose.dev.yml`.

We need to fix one more thing about our Django app: switch out the `runserver` command with `gunicorn`. To do this, let's split `start.sh` into two files: `start_dev.sh` for our development environment (to be ran when we use `docker-compose.dev.yml`), and `start.sh` for our production Django app when we use `docker-compose.yml`. Make sure that both files are executable so docker-compose can run them:

**start_dev.sh**

```
#!/bin/bash

cd backend
python3 manage.py collectstatic --no-input
python3 manage.py makemigrations
python3 manage.py migrate --no-input
python3 manage.py runserver 0.0.0.0:8000
```

**start_prod.sh**

```
#!/bin/bash

cd backend
python3 manage.py makemigrations
python3 manage.py migrate --no-input
gunicorn backend.wsgi -b 0.0.0.0:8000
```

Let's add `gunicorn` to our `requirements.txt` file.

```
$ sudo chmod +x backend/scripts/start_dev.sh backend/scripts/start_prod.sh
```

Be sure to change the `command` part of `docker-compose.yml` and `docker-compose.dev.yml` so that they run `start_prod.sh` and `start_dev.sh`, respectively.

Also, we need to update `backend/Dockerfile` to `COPY` these new files (before it was copying `start.sh`):

```
COPY scripts/start*.sh /
```

This copies both `start_dev.sh` and `start_prod.sh` to the top level of the `backend` container. 

Now let's run our development and production environments to make sure that they both still work. Let's make sure that tests for both the Django and VueJS app both pass. 

You should see that something is not working correctly: requests to our our `backend` service are failing: 

```
Failed to load http://localhost:8000/api/posts/: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://0.0.0.0:8000' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

If you have been accessing `localhost:8000`, you would not have noticed this issue. 

First let's fix the issue, and then we can look into what CORS is, why we don't need it when we access our app on `localhost`, and why do need it when we access our app on `0.0.0.0`. 

First, add `django-cors-headers` to `requirements.txt`. 

Next, in `settings.py` add `'corsheaders',` to `INSTALLED_APPS` and add `'corsheaders.middleware.CorsMiddleware',` to `MIDDLEWARE`.

Finally, make sure that the axios `GET` request in `Posts.vue` has a base URL of `0.0.0.0:8000`. 

Now let's run our app and check to see if we still have an error with `CORS` when trying to access our `backend` API:

```
$ docker-compose up --build
```

Now we should see our posts with no `CORS` errors. We have already changed a lot since our last commit. Let's commit our changes now. 

```
$ git status
On branch vueapp
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   .gitignore
        modified:   README.md
        modified:   backend/Dockerfile
        modified:   backend/backend/settings.py
        modified:   backend/requirements.txt
        deleted:    backend/scripts/start.sh
        modified:   docker-compose.dev.yml
        modified:   docker-compose.yml
        modified:   frontend/src/views/Posts.vue

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        backend/scripts/start_dev.sh
        backend/scripts/start_prod.sh
        nginx/Dockerfile
        nginx/prod.conf

no changes added to commit (use "git add" and/or "git commit -a")
```

```
$ git add .
$ git commit -m "fixed production docker-compose file, added scrpits and configuration files for production environment"
```

Now let's merge our `vueapp` branch back into our `develop` branch. 

```
$ git checkout develop
$ git merge vueapp
```

Finally, we can merge our `develop` branch into `master` and tag the commit with `1.0`. 

```
$ git checkout -b release-1.0 develop
$ git checkout master
$ git merge --no-ff release-1.0
$ git tag -a 1.0
```

## Issues

I have come up against a few issues that were difficult to debug, here's an explination of the issues and how I resolved them. 

### Static files

Since we are using Django's admin and the Django ReST Framework browseable API interface for development and testing, it is important that static files are working properly. 

Here's a guide that I found helpful: 

- [https://blog.skindc.co.uk/dockerise-django-and-static-files-with-nginx/](https://blog.skindc.co.uk/dockerise-django-and-static-files-with-nginx/)

This article takes an elegant approach to serving Django static files from nginx using a shared volume. 

In `docker-compose.yml` we can define an empty volume: 

```yml
volumes:
  django-static:
```

Then we will use this volume in the service definition for both `backend` and `nginx`.

```yml
  backend:
    ...
    volumes:
      - .:/code
      - django-static:/backend/static

  ...

  nginx:
    ...
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - django-static:/usr/src/app/static
```

When the backend container starts, we run `collectstatic` (see `backend/scripts/start_prod.sh`). `collectstatic` is a Django command that depends on static-related settings in `settings.py`: `STATIC_URL` and `STATIC_ROOT`:

```python
STATIC_URL = '/static/'

STATIC_ROOT = 'static'
```

`STATIC_ROOT` is relative to `manage.py`, which is in our top-level `backend` folder: `/backend/static/`, and it is where `admin` and `djangorestframework` will place static files when the `collectstatic` command is executed. 

So, when we run `collectstatic`, all of the collected static files are placed in `/backend/static`, and they are also available in the `django-static` (because we mounted the volume in our `backend` service.) 

Then, in the `nginx` service, we mount the `django-static` volume to `/usr/src/app/static`. When a request that starts with `/static` comes in, we route it to `/usr/src/app/static` instead of having Django process the request. Here's the `location` block in nginx that handles this:

```
    # static files
    location /static {    
      autoindex on;    
      alias /usr/src/app/static;
    }
```

## Continuous Integration

At this point we should integrate continuous integration into our project. Continuous integration will tell us if the code we push to GitLab passes tests. GitLab offers built-in continuous integration that is simple to configure. To start using continuous integration, we need to include a file in the base directory of our project called `gitlab-ci.yml`. If we want to use another name for this file, we can specify this in GitLab's project settings. 

[GitLab Continuous Integration (GitLab CI/CD)](https://docs.gitlab.com/ce/ci/)

[`gitlab-ci.yml` reference](https://docs.gitlab.com/ce/ci/yaml/)

Let's look at a sample `gitlab-ci.yml` file for a Django project like ours: 


```yml
# Official framework image. Look for the different tagged releases at:
# https://hub.docker.com/r/library/python
image: python:3.6

# Pick zero or more services to be used on all builds.
# Only needed when using a docker container to run your tests in.
# Check out: http://docs.gitlab.com/ce/ci/docker/using_docker_images.html#what-is-a-service
services:
  - postgres:latest

variables:
  POSTGRES_DB: postgres

# This folder is cached between builds
# http://docs.gitlab.com/ce/ci/yaml/README.html#cache
cache:
  paths:
  - ~/.cache/pip/

# This is a basic example for a gem or script which doesn't use
# services such as redis or postgres. 
before_script:
  - python -V
  - cd backend && pip install -r requirements.txt

test:
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/$POSTGRES_DB"
  script:
  - python manage.py test --settings backend.ci
```

This `gitlab-ci.yml` file will run all of the tests for our Django application. 

We specify a base image `python:3.6`, and then we define other `services` that we want to use in our test. These services are base images for Docker containers, such as `postgres:latest`.

The `before_script` let's us do setup for our tests. We provide a list of commands to run before running the test. Here, we: 

- Print out the version of python to verify that it is correct
- Change directories to backend and install requirements

Next, in the `test` section, we provide a list of commands that will run one or more tests. Here we simply run `python manage.py test --settings backend.ci`. This runs our tests, but it uses a settings file called `ci.pi` with the following location: `backend/backend/ci.pi`. Let's look at how this file will differ from `settings.py`.

The major difference is in `DATABASES`:

**settings.py**

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

**ci.py**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ci',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'postgres',
        'PORT': '5432',
    },
}
```

Let's commit these changes in a new branch from `develop` called `ci`:

```bash
$ git checkout -b ci develop
$ git add .
$ commit commit -m "added gitlab-ci.yml for CI and added documentation"
$ git checkout develop
$ git merge ci
```

Now let's prepare a new minor release that we branch from `develop`, merge it to `master`, tag it and push it.

```bash
$ git checkout -b release-1.2 develop
$ git checkout master
$ git merge --no-ff release-1.2
$ git tag -a 1.2
$ git push
$ git push --tags
```

**Note**: If you are pushing code to GitLab and don't want GitLab CI to run tests (if you are only making changes to `documentation` or `README.md`, for example) you can add `[skpi ci] to the end of the commit message.

Now let's check the status of our build on GitLab. 

We see that our test failed. If we look at the results of the test, we exactly what happened:

```
$ python manage.py test --settings backend.ci
.F.
======================================================================
FAIL: test_get_posts (posts.tests.TestPosts)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/builds/bcaffey/portal/backend/posts/tests.py", line 21, in test_get_posts
    self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
AssertionError: 200 != 401

----------------------------------------------------------------------
Ran 3 tests in 0.372s

FAILED (failures=1)
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InVzZXIiLCJleHAiOjE1Mzk4MDQyMjksImVtYWlsIjoidXNlckBmb28uY29tIn0.rsl-SgNdeKQsZblRpitq7RL5GGx7Aft8YBi7TIB56cw
Destroying test database for alias 'default'...
ERROR: Job failed: exit code 1
```

While I was testing, I changed the `REST_FRAMEWORK` settings so that unauthenticated users would be able to access posts. Let's change the settings once again so that our tests pass:

We need to uncomment `'rest_framework.permissions.IsAuthenticated',` and `'rest_framework_jwt.authentication.JSONWebTokenAuthentication',`. 

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

## Hot Reloading Fix

To fix hot reloading for `docker-compose.dev.yml`, we need to change our `frontend` service to this: 

```yml
  frontend:
    build:
      context: ./frontend
    volumes:
      - './frontend:/app/:ro'
      - '/app/node_modules'
    ports:
      - "8080:8080"
    depends_on:
      - backend
    networks:
      - django-nginx
```

> Take note of the volumes. Without the data volume ('/usr/src/app/node_modules'), the node_modules directory would be overwritten by the mounting of the host directory at runtime:

[https://mherman.org/blog/dockerizing-a-react-app/#react-router-and-nginx](https://mherman.org/blog/dockerizing-a-react-app/#react-router-and-nginx)


## Adding Element UI

To add Element UI, we need to add the most recent version to `package.json`:

```json
  "dependencies": {
    "element-ui":"^2.4.8",
    ...
  }
```

For now we will do a full import. To do this, we need to import `Element UI` in `main.js`:

```javascript
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.use(ElementUI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
```

Now we can use Element UI components anywhere in our project without importing in each file. There are reasons for why we would want to import components as you need them, and we will talk about these reasons later. 

