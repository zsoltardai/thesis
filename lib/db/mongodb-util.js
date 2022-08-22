import { MongoClient } from 'mongodb';

const USERNAME = process.env.MONGODB_USERNAME;

const PASSWORD = process.env.MONGODB_PASSWORD;

const CLUSTER = process.env.MONGODB_CLUSTER;

const DATABASE = process.env.MONGODB_DATABASE;

export const url = 'mongodb+srv://' + USERNAME + ':' + PASSWORD + '@' + CLUSTER + '.tyk3d.mongodb.net/'
    + DATABASE + '?retryWrites=true&w=majority';

export async function connect() {
    return MongoClient.connect(url);
}

export async function insert(client, collection, document) {
    const db = client.db();
    return db.collection(collection).insert(document);
}

export async function find(client, collection, filter = {}, sort = { _id: 1 }) {
    const db = client.db();
    return db.collection(collection).find(filter).sort(sort).toArray();
}

export async function remove(client, collection, document) {
    const db = client.db();
    return db.collection(collection).delete(document);
}

export async function update(client, collection, _id, updatedFields) {
    const db = client.db();
    return db.collection(collection).update({ _id: _id }, { $set: updatedFields });
}
