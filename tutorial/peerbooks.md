## Installation & Vorbereitungen

In diesem Tutorial bauen wir eine [Sonar](https://arso.xyz/sonar)- App mit [remix.run](remix.run) um unsere E-Books zu verwalten und mit anderen Sonar- Nutzer:innen zuteilen. Wir verwenden in diesem Tutorial Typscript, natürlich steht es euch frei das ganze auch in Javascript umzusetzen.

### Vorbedienungen

Als erstes legen wir uns an einem beliebigen Ort ein neues Verzeichnis für unser Projekt an:

```
mkdir my-peerBooks-app
cd my-peerBooks-app
```

Wir klonen uns [Sonar](https://github.com/arso-project/sonar) mit:

`git clone git@github.com:arso-project/sonar.git`

Wir installieren Sonar wie [hier](https://github.com/arso-project/sonar#development) beschrieben und starten Sonar fürs erste mit deaktivierter Authentifizierung und im Developer Mode:

```
# install dependencies of all workspaces
yarn && yarn build

# start the sonar server in dev mode
./sonar start --dev --disable authentication
```

Nachdem start von Sonar wird uns ein Token angezeigt welchen wir in den nächsten Schritten benötigen daher kopieren wir diesen.

Danach wechseln wir in unser Projekt Verzeichnis und installieren Remix:
`npx create-remix@latest`
Wir geben der Remix-App den Namen `peerbooks`, wählen `Just the basics` aus und benutzen den `Remix App Server` mit `Typescript` (wahlweise Javascript) und erlauben dem Script `npm install` auszuführen.

### Konfiguration

Um Sonar zusammen mit Remix zu verwenden wechseln wir das Remix Verzeichnis (`my-peerBokks-app/peerbooks`).

Wir fügen den Sonar-client den Dependencies in der Package.json hinzu:
```"@arsonar/client": "^0.6.0-alpha.5",```

Da wir in der Applikation noch einige andere Dependencies haben wie z.B. die React/Icons finddest du hier die `package.json` zum kopieren:

```
{
"private": true,
"sideEffects": false,
"scripts": {
"build": "remix build",
"dev": "remix dev",
"start": "remix-serve build"
},
"dependencies": {
"@arsonar/client": "^0.6.0-alpha.5",
"@remix-run/node": "^1.5.1",
"@remix-run/react": "^1.5.1",
"@remix-run/serve": "^1.5.1",
"dotenv": "^16.0.1",
"react": "^17.0.2",
"react-dom": "^17.0.2",
"react-icons": "^4.4.0",
"simple-isbn": "^1.1.5"
},
"devDependencies": {
"@remix-run/dev": "^1.5.1",
"@remix-run/eslint-config": "^1.5.1",
"@types/react": "^17.0.45",
"@types/react-dom": "^17.0.17",
"eslint": "^8.15.0",
"typescript": "^4.6.4"
},
"engines": {
"node": ">=14"
}
}
```

Wir erstellen eine neue .env File mit folgendem Inhalt wobei wir den kopierten Token hier einfügen:

```env=
NODE_ENV=development
SONAR_TOKEN=TOKEN
SONAR_COLLECTION=Books
```

Erstelle in `root.tsx` eine neue Funktion `Document`:

```jsx=
// peerBooks/app/root.tsx

import type { MetaFunction } from '@remix-run/node'
import {
Links,
LiveReload,
Meta,
Outlet,
Scripts,
ScrollRestoration,
} from '@remix-run/react'

export const meta: MetaFunction = () => ({
charset: 'utf-8',
title: 'Sonar | PeerBooks',
viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
return (
<html lang='en'>
<head>
<Meta />
<Links />
</head>
<body>
<Outlet />
<ScrollRestoration />
<Scripts />
<LiveReload />
</body>
</html>
)
}
```

## Los gehts ...

Nach dem nun der Grundstein für unsere App gelegt ist erstellen wir ein Schema für unsere Daten.

### Schema

Erstelle neue Datei in `peerbooks/app` mit dem Namen `schema.ts`:

```typescript=
// peerBooks/app/schema.tsx

import type { TypeSpecInput } from '@arsonar/client'

type Spec = {
defaultNamespace: string
types: Record<string, TypeSpecInput>
}

export const schema: Spec = {
defaultNamespace: 'sonar-peerBooks',
types: {
ImportedMetadata: {
title: 'Imported metadata',
fields: {
sourcePlatform: {
type: 'string',
},
content: {
type: 'object',
},
},
},
Book: {
title: 'book',
fields: {
title: {
type: 'string',
},
isbn: {
type: 'string',
},
identifiers: {
type: 'array',
},
publishers: {
type: 'array',
},
openLibraryUrl: {
type: 'string',
},
inLanguage: {
type: 'string',
},
genre: {
type: 'string',
},
authors: {
type: 'array',
},
description: {
type: 'string',
},
coverImageUrl: {
type: 'string',
},
metadata: {
type: 'object',
},
},
},
},
}

```

### Collection

Wir brauchen eine neue Datei in `peerbooks/app` mit dem Namen `sonar.server.tsx`:

Zuerst importieren wir den `Workspace` und den type `Collection` aus dem `Sonar-Client`, weiter benötigen wir unser `Schema` und das `Dotenv`-Fil :

```typescript=
import { Workspace } from '@arsonar/client'
import type { Collection } from '@arsonar/client'
import Dotenv from 'dotenv'
import { schema } from './schema'
```

Wir rufen die Konfiguration auf und legen uns folgende Konstanten an:

```const url = process.env.SONAR_URL || 'http://localhost:9191/api/v1/default'
const token = process.env.SONAR_TOKEN
```

Weiter initialisieren wir den Client und reexportieren ihn:

```export const workspace = new Workspace({
url,
accessCode: token,
})

export default workspace
```

Als nächstes holen wir uns den `collectionName` aus der Konfiguration:

```
let collection: Collection | undefined

export const collectionName = process.env.SONAR_COLLECTION || 'default'
```

Wir schreiben den Code um eine Collection zu öffnen bzw. zu erstellen, wenn sie nicht existiert. Wir prüfen ob eine Collection vorhanden ist, wenn nicht versuchen wir die Collection mit unserem collectionName zu öffnen, wenn es dabei einen Fehler gibt, erstellen wir eine neue Collection mit unserem CollectionName. Anschließend prüfen wir ob in der nun sicher vorhanden Collection ein Schema mit unserem Schemaname vorhanden ist, wenn nicht wird dieses erstellt.

```
export async function openCollection(): Promise<Collection> {
if (!collection) {
try {
collection = await workspace.openCollection(collectionName)
} catch (err: any) {
collection = await workspace.createCollection(collectionName)
}
console.log('opened collection', collection.key)
await ensureSchema(collection)
}
return collection
}
```

Die funktion zum überprüfen unseres Schemas kann wie folgt aussehen:

```
async function ensureSchema(collection: Collection) {
collection.schema!.setDefaultNamespace(schema.defaultNamespace)
for (const [name, type] of Object.entries(schema.types)) {
if (!collection.schema!.hasType(name)) {
const spec = { name, ...type }
await collection.putType(spec)
console.log('created type', name)
}
}
}
```

Damit wir später ohne große Umstände einen neuen Record anlegen können definieren wir uns noch folgende Funktion:

```
export async function createBookRecord({
title,
isbn,
authors,
url,
identifiers,
publishers,
cover,
fileId,
}: BookMetadata) {
const collection = await openCollection()
const record = await collection.put({
type: 'Book',
value: {
title: title,
authors: authors,
openLibraryUrl: url,
isbn: isbn,
identifiers: identifiers,
publishers: publishers,
coverImageUrl: cover || '',
file: fileId,
},
})
return record
}
```

Da es Typscript so nicht gefällt müssen wir noch kurz unsere Typen definieren.

```
interface BookMetadata {
title: string
isbn: string
authors: string[]
url: string
identifiers: string[]
publishers: string[]
cover: string
fileId: string
}
```

### routes/index.tsx

Weiter geht es mit der Startseite. Wir erstellen uns einen kleinen Daten-Mock mit Beispieldaten und geben uns diesen testweise auf der Startseite aus. Die `routes/index.tsx` sieht danach folgendermaßen aus:


//TODO 
Sonar startet nicht 
