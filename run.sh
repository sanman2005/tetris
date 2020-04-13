git reset --hard
git pull

cd config/docker/
sudo docker-compose down
sudo docker volume prune
sudo docker-compose up --build -d
