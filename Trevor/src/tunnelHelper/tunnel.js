const localtunnel = require('localtunnel');

const MAX_ATTEMPTS = 5; //keeps track of max attempts at creating the tunnel 

//make a function that accepts a port number, and creats localtunnel at that port, and also has a variable keeping track of the number of times it tried to create the tunnel
createTunnel = async (port, retries = 0) => {
	const tunnel = await localtunnel({
		port,
		subdomain: process.env.TUNNEL_SUBDOMAIN,
		host: process.env.TUNNEL_SERVER_HOST
	});
	//make a local tunnel with port set to the port parameter and with domain and subdomain as defined in the .env file
	//this will make the local tunnel the same everytime as long as the local tunnel can be created
	
	const tunnelUrl = tunnel.url;
	
	const usedSubDomain = tunnelUrl.includes(process.env.TUNNEL_SUBDOMAIN);  //a boolean telling if the url we wanted was created, or if a random url was generated instead. 
	if (!usedSubDomain && retries < MAX_ATTEMPTS) {  //if the number of tries to make the tunnel and it had to use a random url, and it has been less then MAX_RETRYS attemps, then try again.
		console.warn('sundomain not available');
		tunnel.close();    //close the tunnel
		return setTimeout(
			() => { createTunnel(port, ++retries); }, 
			200
		); //retry making the tunnel again after 200 miliseconds
	}
	
	if (!usedSubDomain){  //if making the tunnel with the url we wanted doesn't work, tell the user so then can do something about that. 
    console.warn('could not use the wanted subdomain, a random one was used instead');
	}
	
	console.log(`listening at localhost:${port} || tunnel: ${tunnelUrl}`)

}	

module.exports = {
	createTunnel
}; //export the createTunnel function for use elsewhere.