up-python:
	python -m flask run --debug

up-react:
	yarn --cwd frontend dev

setup:
	pip install -r app/requirements.txt
	yarn --cwd frontend
