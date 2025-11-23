option=$1
kpi_dir=~/kpi-platform

case $1 in 

  build)
    cd $kpi_dir/client
    npm run build
    ;;

  db)
    mysql -u root -p -D reporteria_test
    ;;

  pull)
    cd $kpi_dir/server
    rm access.log
    cd ..
    git pull
    ;;

  server)
    killall -9 node
    cd $kpi_dir/server
    screen -S server -m npm run server
    ;;

  stop)
    killall -9 node
    ;;

  show)
    screen -r server
    ;;

  deploy)
    # pull
    cd $kpi_dir/server
    npm i
    rm access.log
    cd ..
    git pull

    # build
    cd $kpi_dir/client
    npm i
    npm run build

    # start server
    killall -9 node
    cd $kpi_dir/server
    screen -S server -m npm run server
    ;;

  -h)
    echo Available options:
    echo -e 'build \t build frontend'
    echo -e 'deploy \t deploys whole app'
    echo -e 'pull \t make git pull request'
    echo -e 'server \t run server'
    echo -e 'stop \t stop server'
    echo -e 'show \t show server status'
    ;;
  
  *)
    echo USAGE: kpi-platform [OPTION]
    echo Options available via kpi-platform -h
    ;;
esac
