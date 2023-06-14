# A Simple, Self-Hosted, Full-Stack ChatGPT App


[![简体中文 badge](https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-Simplified%20Chinese-blue)](./docs/README_ZH.md)

Deploy your own ChatGPT website using your OpenAI key. This project leverages React for the frontend, Express for the backend, and MongoDB for the database.

## Features:

1. Contextual conversations are turned off by default to save tokens. You can turn on Context mode and set where the conversations starts. 
   ![Context](https://user-images.githubusercontent.com/41911311/245662593-3980ff48-efb2-4479-a42d-16fa62fafc51.png)

2. Built-in browsing functionality for web searches or direct URL analysis[^1][^2].
    ![Browse](https://user-images.githubusercontent.com/41911311/245662584-38710aab-17a2-4c21-885e-856142fc464a.png)

3. Monitor the usage of your current account[^3].
 ![Usage](https://user-images.githubusercontent.com/41911311/245663449-3250f9d6-c85c-47ab-9592-c2a47b460693.png)

1. Customizable templates.
![Templates](https://user-images.githubusercontent.com/41911311/245662102-1d3ad122-a09b-4922-a32f-7bf253df3905.png)
1. Register your own account to save conversation history and usage data.

2. Export or restore your conversation history with just one click.
![Export history](https://user-images.githubusercontent.com/41911311/245662097-e31049a5-eae8-4cc8-8e4a-1cf40e219d9a.png)

1. Others: streaming answer for better experience; highlight of codes; auto-generated titles for conversations (or rename it yourself) ...

[^1]: The browse feature currently doesn't support context.
[^2]: The browse feature uses chatgpt-3.5. 
[^3]: The usage calculation is an estimate.


## Installation:

1. Ensure that Node.js and MongoDB are installed on your machine.
   - Install Node.js using [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager). This project was developed using Node v18.14.1.
   - Install the latest version of [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/).
   
2. Clone this repository.

3. Install dependencies.
   Run `npm i` in both `api` and `client` directories.

4. Enter your OpenAI Key.
   Create a `.env` file in the `api` directory and include the following line:
   ```
   OPENAI_KEY=<Your key>
   ```
   You can also directly write the key into `api/config.js`, although it's not recommended.
   You can set the port number for running this app in `api/config.js`.
   Make sure that the `production` property in both `api/config.js` and `client/src/config.js` is set to `true`.

5. Build the React app.
   Run `npm run build` in the `client` directory and then move the build directory to `api` with `mv build ../api/`.

6. Start the app.
   Run `node server.js`. For running in the background, you can use tools like `nohup` or `pm2`.

## Troubleshooting:

1. Ensure your MongoDB server is running and its URL matches the one specified in `api/config.js`.

2. Make sure the corresponding server port is open.

## To-Do:

- [ ] Add support for PDF or TXT file analysis.

- [ ] Implement a switch for stream mode.

- [ ] Enable archive conversation restoration.

- [ ] Allow keyword search in conversation history.

- [ ] Correct token calculations.

- [ ] Implement context feature for browse mode.

- [ ] Support individual OpenAI keys per account.

- [ ] Create a desktop version.





## Disclaimer:

This project is open-source and developed by the author for practice. If you wish to use it, please take full responsibility for its security.

