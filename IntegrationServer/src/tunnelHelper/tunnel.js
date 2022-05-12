const localtunnel = require('localtunnel');

const MAX_ATTEMPTS = 5; //keeps track of max attempts at creating the tunnel 

//make a function that accepts a port number, and creats localtunnel at that port, and also has a variable keeping track of the number of times it tried to create the tunnel
createTunnel = async (port, retries = 0) => {
	const tunnel = await localtunnel({    //attempt to create a local tunnel with a desired host and subdomain. 
		port,
		subdomain: process.env.TUNNEL_SUBDOMAIN,
		host: process.env.TUNNEL_SERVER_HOST
	});
	
	const tunnelUrl = tunnel.url;
	
	//Check if the desired subdomain was obtained. IF it was not, retry unitl MAX_ATTEMPS is reached, or until the desired subdomain is obtianed
	const usedSubDomain = tunnelUrl.includes(process.env.TUNNEL_SUBDOMAIN);
	if (!usedSubDomain && retries < MAX_ATTEMPTS) {
		console.warn('subdomain not available');
		tunnel.close();    //close the tunnel so a new attempt can be made
		return setTimeout(
			() => { createTunnel(port, ++retries); }, 
			200
		); //retry making the tunnel again after 200 miliseconds
	}
	
	if (!usedSubDomain){  //if the desired subdomain could not be obtained, tell the user so then can do something about that. 
    console.warn('could not use the wanted subdomain, a random one was used instead');
	}
	
	console.log(`listening at localhost:${port} || tunnel: ${tunnelUrl}`)

}	

module.exports = {
	createTunnel
}; //export the createTunnel function for use elsewhere.