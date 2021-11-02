## WHAT IS GOING ON HERE

So, as long as you have node.js installed. Things should be okay enough. 

Open a command prompt to the folder and run: 
- npm install
- npm start

<br>This should automatically set everything up. I think it should install local tunnel, if not
just run this:
- npm install -g localtunnel

So, once everything is running, you'll need two command promt windows open. If you have windows, look up windows terminal. 
<br>In one window, you can run: npm start
<br>In the other window, you can run: lt --port 3000
<br>The url it returns will be put into the monday.com in an integration, under feature details. It'll be the the Base URL. 


Once you do all that, then the server is up and ready to go. 
<br>Granted, you still need the proper intatgration in monday set up.    

If you want the things that are set to accept values at ./hi to work, you need to make sure the corresponding custom action block in monday, has it's run url set to "/hi". 