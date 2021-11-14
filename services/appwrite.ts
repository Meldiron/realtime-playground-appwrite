import { Appwrite } from "appwrite";
import type { Models } from "appwrite";

const generateRandomHex = (size = 6) => {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    for (let n = 0; n < size; n++) {
        result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
}

type CursorRealtime = {
    event: string;
    channels: string[];
    timestamp: number;
    payload: Cursor;
};

type Cursor = {
    clickPos: string;
    cursorPos: string;
    lastAction: 'none' | 'move' | 'click';
    userId: string;
    color: string;
} & Models.Document;


// Init your Web SDK
const sdk = new Appwrite();

sdk
    .setEndpoint('https://demo.appwrite.io/v1')
    .setProject('6190f1783c600');

const cursorCollectionId = "6190fb24b7748";

// Appwrite related cache
export const AppwriteServiceData: {
    accountId: null | string,
    cursorDocumentId: null | string,
    cursorColor: null | string
} = {
    accountId: null,
    cursorDocumentId: null,
    cursorColor: null
};

// Appwrite service itself
export const AppwriteService = {
    async registerListener(callback: (payload: CursorRealtime) => void) {
        const _unsubscribe = sdk.subscribe(`collections.${cursorCollectionId}.documents`, callback);
    },

    async pushMouseAction(action: 'move' | 'click' | 'none', x: number, y: number) {
        if (!AppwriteServiceData.cursorDocumentId) {
            throw new Error("Document not yet obtained. Pease run initAccount() first.");
        }

        const dataObj: Partial<Cursor> = {
            lastAction: action
        }

        if (action === "click") {
            dataObj.clickPos = `${x};${y}`;
        }


        if (action === "move") {
            dataObj.cursorPos = `${x};${y}`;
        }

        await sdk.database.updateDocument<Cursor>(cursorCollectionId, AppwriteServiceData.cursorDocumentId, dataObj);
    },
    async initAccount() {
        try {
            const accountRes = await sdk.account.get();
            AppwriteServiceData.accountId = accountRes.$id;
        } catch (err) {
            // Not logged in
            const sessionRes = await sdk.account.createAnonymousSession();
            AppwriteServiceData.accountId = sessionRes.userId;
        }

        try {
            const collectionRes = await sdk.database.listDocuments<Cursor>(cursorCollectionId, [`userId=${AppwriteServiceData.accountId}`], 1);
            if (collectionRes.documents.length <= 0) {
                throw new Error("Document not found");
            }

            AppwriteServiceData.cursorDocumentId = collectionRes.documents[0].$id;
            AppwriteServiceData.cursorColor = collectionRes.documents[0].color;
        } catch (err) {
            // Document not created yet
            const collectionRes = await sdk.database.createDocument<Cursor>(cursorCollectionId, {
                clickPos: "-1000;-1000",
                cursorPos: "-1000;-1000",
                lastAction: "none",
                userId: AppwriteServiceData.accountId,
                color: '#' + generateRandomHex()
            }, ['*']);

            AppwriteServiceData.cursorDocumentId = collectionRes.$id;
            AppwriteServiceData.cursorColor = collectionRes.color;
        }
    }
}