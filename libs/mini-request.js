/* global Buffer */

const https=require('https');
const http=require('http');
const url=require('url');

async function Request(link,options,data)
{
	const {protocol}=url.parse(link);
	let H=protocol==='https:'?https:http;
	return new Promise((resolve,reject)=>{
		let req=H.request(link,options,res=>{
			res.on('error',reject);
			let chunks=[];
			res.on('data',c=>chunks.push(c));
			res.on('end',_=>resolve(Buffer.concat(chunks)));
		});
		req.on('error',reject);
		data&&req.write(data);
		req.end();
	});
}

module.exports=Request;