# ================================================================================
# File Name:   test_dime_client.py
# Author:      Zack Malkmus
# Date:        11/16/2023 (last modified)
# Description: Test cases for AGVis-DiME integration
# Note:        Running this test mulitple times in succession will result in
#              failure as DiME takes a while to terminate.
# ================================================================================

from dime import DimeClient
import pytest
import time
import subprocess
import psutil

@pytest.fixture(scope="module")
def dime_server():
    """Fixture to start and stop the dime server"""
    server = start_dime_server()
    yield server
    stop_dime_server(server)

def start_dime_server():
    """Spin up the dime server"""
    try:
        command = "dime -l tcp:8888"
        server = subprocess.Popen(command, shell=True)
        time.sleep(0.5) # Let DiME start
        return server
    except Exception as e:
        print(f"Failed to start DiME server: {e}")
        return None
    
def stop_dime_server(server):
    try:
        """
        For some reason, dime spawns zombie processes that are hard to terminate.
        This code ensures all instances of dime that we just spawned are removed.
        """
        parent = psutil.Process(server.pid)
        for child in parent.children(recursive=True):
            child.terminate()
        _, alive = psutil.wait_procs(parent.children(), timeout=5)
        if alive:
            for child in alive:
                child.kill()
            parent.kill()
            parent.wait(timeout=5)
    except Exception as e:
        print(f"Failed to stop DiME server: {e}")

def test_dime(dime_server):
    d1 = None
    d2 = None
    d3 = None

    server = dime_server

    assert server != None

    try:
        d1 = DimeClient("tcp", "localhost", 8888)
        d2 = DimeClient("tcp", "localhost", 8888)
        d3 = DimeClient("tcp", "localhost", 8888)
        d1.join("turtle", "lizard")
        d2.join("crocodile")
        d3.join("dragon", "wyvern")
        assert d1.devices() == ['crocodile', 'wyvern', 'lizard', 'dragon', 'turtle']
    except Exception as e:
        print(f"Test Failed: {e}")
        assert False
    finally:
        if d1:
            d1.close()
        if d2:
            d2.close()
        if d3:
            d3.close()
        time.sleep(1)
        stop_dime_server(server)