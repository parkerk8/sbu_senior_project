## WHAT IS GOING ON HERE

So, as long as you have node.js installed. Things should be okay enough. 

Open a command prompt to the folder and run: 
- npm install
- npm start

<br>This should automatically set everything up. I think it should install local tunnel, if not
just run this:
- npm install -g localtunnel
- npm install -g nodemon

## SETTING UP THE .env FILE
So, for this to work you'll need an .env file
I might end up adding one to the git repository, but thats for latter probably. 

Anyway, you'll need the following feilds in the .env file ***OR IT WON'T WORK AND YOU'LL BE SAD***

- MONDAY_SIGNING_SECRET=
- PORT=
- TUNNEL_SUBDOMAIN=
- TUNNEL_SERVER_HOST=http://loca.lt
<br>

Monday Signing secret will come from your monday app<br>
Port can be whatever you want; that being said, use 3000. If you choose to use a different port, please update package.json appropiately: set it to kill the correct port.<br>
Tunnel Subdomain can be whatever you want it to be, as long it is open. <br>
Change TUNNEL_SERVER_HOST at your own risk.
  
## ANYWAY,

So, once everything is running, you'll need one command promt windows open. If you have windows, look up windows terminal. You don't need it for anything anymore, I just like it. 
<br>In one window, you can run: npm start
<br>The url it returns will be put into the monday.com in an integration, under feature details. It'll be the the Base URL.
<br> 


Once you do all that, then the server is up and ready to go. 
<br>Granted, you still need the proper intatgration in monday set up.    

If you want the things that are set to accept values at ./hi to work, you need to make sure the corresponding custom action block in monday, has it's run url set to "/hi". 