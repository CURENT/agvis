# Quick Start

## Using AGVis On Server through SSH
### Running AGVis
Using a terminal (we would suggest [VSCode](https://code.visualstudio.com/)), log into the Linux server with SSH. Then use this command to download the LTB repository:
```
git clone https://github.com/CURENT/ltb2 --recursive
```

After it's finished downloading, move to the AGVis folder and create the initial build:
```
cd ltb2/agvis
./go.sh build
```

Once the initial build is completed, setup the environment by running these commands in your terminal:
```
tmux
./go.sh dev2
```

By running those two commands, your window should be populated with several tmux sessions. At this point you may need to forward ports 8810 and 8818 if they are not automatically forwarded. Once your ports are set up, you should be able to go to "localhost:8810" in your browser and see AGVis running. If you then run the command in the bottom tmux window, the simulation will start playing. 

### Troubleshooting
#### Port Already in Use Error
If you receive this error, then you may need to check the /tmp directory in your environment. If there is a folder called "dime" or "dime2", remove it. That should fix the error.

#### ANDES Does Not Exist Error
If ANDES doesn't exist, then your best bet is usually just rebuilding your environment. Running ```./go.sh clean``` and then running the second and third set of commands again should fix the issue.

## Using AGVis Locally
### On Linux
#### A Side Note
As of writing this, tmux, a command used for running AGVis is not available on Windows-based systems. This can be worked around by running AGVis in the Windows Subsystem for Linux (WSL). The additional setup required for this is included at the bottom of the instructions.

#### Setup
Docker Desktop is a required program for running AGVis locally. The installer can be downloaded here: https://www.docker.com/products/docker-desktop/.

Open your terminal and run these commands to download the necessary folders:
```
git clone https://github.com/CURENT/agvis
git clone https://github.com/CURENT/dime
git clone https://github.com/CURENT/andes
```

Now, change to the "agvis" directory and run the build command for the Docker image using these commands:
```
cd agvis
./go.sh build
```

##### Troubleshooting
Your system may run into an issue when attempting to clone necessary GitHub folders while the image is building. If this occurs, you may need to edit the "Dockerfile" by adding the line
```
RUN git config --global url."https://github.com/".insteadOf git://github.com/
```
as shown in the following image.

<img width="601" alt="docker3" src="https://user-images.githubusercontent.com/59810286/162656954-7a289951-76ce-4c2e-9553-cbf801047739.PNG">


#### Running AGVis
With the setup done, running AGVis is fairly trivial. Enter these two commands into your terminal:
```
tmux
./go.sh dev
```
This will start a new tmux session and begin running the visualization, which can be found by going to "localhost:8810" in your web browser. It should look something like this:

<img width="960" alt="docker4" src="https://user-images.githubusercontent.com/59810286/162657629-add488b9-8ed3-47ae-a903-12392a68d940.PNG">

Your terminal should also now be populated with several sessions. The selected session should have a command ready to run a simulation. Enter the command with your web browser open on "localhost:8810" and the simulation will begin to play in the browser. 

Once you are done with the simulation you can run
```
tmux detach
./go.sh clean
```
to shut down the process.

#### Further Information
[AGVis Repository](https://github.com/CURENT/agvis)

[DiME Repository](https://github.com/CURENT/dime)

[DiME Documentation](https://ltbdime.readthedocs.io/en/latest/)

[ANDES Repository](https://github.com/CURENT/andes)

[ANDES Documentation](https://docs.andes.app/en/stable/)


### Additional Setup for Windows
#### WSL
If you have not installed the Windows Subsystem for Linux (WSL) open Windows Powershell and run this command:
```
wsl --install
```
If it is already installed, this command should show you the WSL help text.

With WSL on your system now, you can install a Linux distribution. Run the following command to install Ubuntu:
```
wsl --install -d Ubuntu
```
Once this command has finished, it should open an Ubuntu terminal window. Follow the instructions on this window once it finishes giving the installation message. Once you have finished setting up your user, run these commands in the Ubuntu window:
```
sudo apt update
sudo apt upgrade
```
Once they are finished, close the Ubuntu window. Return to the Powershell window and now run:
```
wsl.exe --set-version Ubuntu 2
```

#### Docker
Once the command finishes upgrading to WSL 2, open Docker Desktop. If you have yet to install Docker Desktop, please see the instructions under the "Linux Setup" section. Click on the "Settings" icon.

<img width="960" alt="docker0" src="https://user-images.githubusercontent.com/59810286/162659572-758ebc5d-c8f0-49f8-a4f2-3dc444bb1ee8.PNG">

From here, click on the "Resources" tab.

<img width="960" alt="docker1" src="https://user-images.githubusercontent.com/59810286/162659759-5801bc36-ea4e-41a2-837b-c3f5d8c4fe69.PNG">

Now, click the "WSL Integration" under the "Resources" tab. From here, check the "Enable integration with my default WSL distro" box and click the Ubuntu slider under "Enable integration with additional distros:". Then click the "Apply & Restart" button. 

<img width="960" alt="docker2" src="https://user-images.githubusercontent.com/59810286/162660357-ba7563f0-ae28-4779-8d37-0bf18c41c5c0.PNG">

Finally, open Windows Powershell again. Run
```
ubuntu
```
to run WSL in the Ubuntu distribution you installed earlier. You can now proceed with the Linux instructions to run AGVis.

