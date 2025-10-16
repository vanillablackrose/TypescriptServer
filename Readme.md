APIs available for Chirpy:

GET:

- api/healthz: Sends an OK response if the server is functioning
- admin/metrics: Returns the page request count for the current login session
- api/chirps: Returns chirps: Optionally pass in an author ID to get all chirps by author, otherwise returns all chirps in asc
-                order of creation date. Pass in sort=desc to return in descending order. Use authorId to pass in the author ID
- api/chirps/:chirpID: Returns JUST the chirp with the given ID

POST

- api/login : Log in the user. Pass in a valid email and password, will hash the password and check against the database. Will
-               create a JWT key for 1 hr and return the key along with the user's refresh key in a JSON blob
- api/users: Create a new user: Pass in an email and a password, will create the user along with a JWT and refresh key and
-             return the data in a JSON blob
-
- api/chirps: Create a new chirp. Pass in the chirp body text, no more than 140 characters. The Authorization header must have
-                the format Bearer <JWTKey>
- api/refresh: Create a new JWTKey to refresh the acess for another hr. Authorization header must have the format Bearer
-               <RefreshKey>. Returns the new JWTKey in a JSON blob.
- api/revoke: Revokes access for the refresh key. Authorization header must have the format Bearer <RefreshKey>
- api/polka/webhooks: Upgrades the user to chirpy red. Authorization header must have the format Apikey <PolkaKey>
- admin/reset: Clears ALL databases.

PUT

- api/users : Updates the user's email and password. Authorization header must have the format Bearer <RefreshKey>

DELETE

- api/chirps/:chirpID : Deletes a chirp with the given ID. Authorization header must have the format Bearer <RefreshKey>
