import { MongoClient } from 'mongodb';

export const connect = async function () {
	try {
		return MongoClient.connect(process.env.MONGODB);
	} catch (error) {
		console.log(error);
		return null;
	}
}
