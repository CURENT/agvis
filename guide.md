# Remote access to LTB

## Install VS Code and configure SSH

If you do not have VS Code on your machine, you can install it first, and then configure the remote access.

1. Install [VS Code](https://code.visualstudio.com/![image](https://user-images.githubusercontent.com/79226045/133316409-186154e3-46ea-4ac9-b75d-d6a8d666899a.png)
)
![image](https://user-images.githubusercontent.com/79226045/133316365-9c1e8fad-14f0-43d8-8956-fa1dd1a3e8b5.png)

2. Install necessary extensions:
(When you install ‘Remote – SSH’, another one will be installed automatically.)
![image](https://user-images.githubusercontent.com/79226045/133316785-eb931cda-7bb0-4df4-8ed1-b4b73365d589.png)

3. Add a new SSH:
![image](https://user-images.githubusercontent.com/79226045/133316894-8bcb19e2-7fd2-432a-9fa4-e3c94ba5f4d2.png)
![image](https://user-images.githubusercontent.com/79226045/133316950-38854760-06d5-455f-86f6-46551c6cbc23.png)

4. Conenct to the SSH you just added:
![image](https://user-images.githubusercontent.com/79226045/133317033-302b42e5-c12f-4629-bc9d-8b59ff80d589.png)

5. Select platform and input passwords:
![image](https://user-images.githubusercontent.com/79226045/133317228-927d3448-f7e5-4f48-a55f-74ae914d25c6.png)

Now we assume that you have access to the SSH.

6. You can check out the files:
![image](https://user-images.githubusercontent.com/79226045/133362514-3c154699-7edf-4f41-b4f6-58724b49fbc4.png)

## Use LTBVIS

Before using LTBVIS, please install docker in the VS Code estension market.

The LTBVis is already installed in the server for the common account '/home/curentltb/ltb/ltbvis'.

1. Hit ``Ctrl + ~`` to open the terminal window. Change path to the LTBVIS location:
```
cd /home/curentltb/ltb/ltbvis
```

2. Build the LTBVIS:
```
./go.sh build
```

3. Open tmux:
```
tmux
```

4. Now you are in the tmux, run the LTBVIS by below command.
```
./go.sh dev2
```
Then there are three panes, which are http, dime2, and control respectively.

5. In the port panel, port 8810 should be forwarded automatically, and you need to forward the port 8818. Now the communication is ready, then open the web 'localhost:8810' in your browser (Chrome is recommended) and visualization window should be there.

6. In the tmux command window, the command is already input there, just hit 'enter' and you should be able to run the example case.

7. After using, please close the program propoerly, or it will cause trouble in the next time use.
(1) In tmux, you can hit ``Ctrl + B``, and then hit arrow keys to swithch between panes.
(2) Switch to dime2 window, hit ``Ctrl + C`` to close dime2.
(3) Switch to http window, hit ``Ctrl + C`` to close http.
(4) Then in the control pane, exit the tmux by ``tmux detach``. Finally clean the docker images and tmux sessions by ``./go.sh clean``.

Trouble shooting:

1. If no visualization appears in the browser, check if the port is forwarded correctly.

2. If in the dime pane, it said: "Address already in use", you may need to delete the '/tmp/dime2' and then run the LTBVIS again.

3. If the port is already in use, you may remove those ports in the port panel and then run again.

4. If ANDES said the file does not exist, check the mounting path. The default path is '`pwd`/cases' ('/home/curentltb/ltball/ltbvis/cases'), if you need to change the path, please change the path before ':/home/cui/work' in the ``docker run ...``. It should be noted that the blank space in the path may cause error, if so please include your path in the double quote.

Other ANDES command:

If you need any other ADNES command, just modify the andes part in the docker command (`... andes run wecc_vis.xlsx -r tds ...`).

Generate the output csv file:
```
andes plot weec_vis_out.npz --to-csv
```

Use the existing output:
```
andes run weec_vis_out.xlsx --from-csv weec_vis_out.csv
```

More details:

ANDES Documentation:

https://docs.andes.app/en/stable/

LTBVIS:

https://github.com/CURENT/ltbvis

## Additional notes
Play with Jupyter Notebook:

* Open in VS Code:
(Make sure you have installed Jupyter extension.)
![image](https://user-images.githubusercontent.com/79226045/133362670-26c80664-b8cb-4261-ac72-c85c0ab9ad74.png)
![image](https://user-images.githubusercontent.com/79226045/133362684-32dffa56-6f92-46c2-97d6-2f4963008e4f.png)

* Open in browser:

  a) Open terminal by:
  `Ctrl` + `~`
  ![image](https://user-images.githubusercontent.com/79226045/133363066-0e903e3f-d669-47a4-a84d-6c1bee881fa9.png)

  b) CD to the path which will be the root path:
  ![image](https://user-images.githubusercontent.com/79226045/133363175-c62d58a6-f605-4959-804e-fa41441436f3.png)

  c) open jupyter notebook by:
  ```
  jupyter notebook
  ```
  If it does not open browser automatically, you can open it manually from the link:
  ![image](https://user-images.githubusercontent.com/79226045/133363429-2b32c5d4-40be-40b8-90ec-d3291c1f658d.png)

  If you cannot find the desired kernel (usually it should be `andes`), you will need to install ipykernel.
  ![image](https://user-images.githubusercontent.com/79226045/133363607-16c4fcfd-4ef3-4276-ba1e-a3d636f99f60.png)
