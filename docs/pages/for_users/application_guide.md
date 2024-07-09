## Application Guide
### SIWE
- PORTERS accounts are created and managed by SignInWithEtereum. Connect your wallet, sign the message to verify ownership and your account will be automatically generated.
- If you are using PORTERS in a team setting, one Admin will manage the account however payment can be handled by a MS, DAO Treasury or any other EOA. Simply [swap for PORTR](https://www.porters.xyz/swap) and send to the Admin's Address for relay redemption
### Create App
1. Click `CreateApp` to bring up modal
![image](https://hackmd.io/_uploads/BJ5XRvnL0.png)
2. Choose a Name for your application. This is just for internal MGMT, the appID will be generated for you
3. (Optional) Provide a short description. This is also just internal and helpful in distinguishing between your apps
4. Click `Create New App` to finish 
5. Your NewApp is now in your `My Apps` list, click on this instance to bring up the detail page where you can pull URI endpoints for specific Networks and set rules for managing the RPC services per app.
### Dashboard
The PORTERS Dashboard gives an overview of all of your account's pertinant information and actions. Including data on the relay usage of your apps, overview of your apps and ability to create new apps.
- Insights
    - Usage: Graphical representation of the requests sent from your apps over set time period.
    - Total Requests (over set time frame) 
    - Account Balance: Total amount of relay credits held by your account. This balance is increased by redeeming PORTR tokens within the app
    - Success rate: 
- My Apps
    - App Name: Generic name for Application designated by the user. This name can be changed at will (along with the App's desciption)
    - App ID: URI for the Application, this cannot be changed
    - Active: yes/no
    - Date Created
### App Detail Page
Selecting a specifc App from the list under "My App" will bring you to insights for that specific app as well as the endpoints for your Build and rules governing the app's RPC service.
#### Endpoints
URI's for the each network serviced by PORTERS. MGMT of the app's connection to specific Networks is handled in the "Rules" tab.
#### Rules
- Secret Key: Allows you to add an extra layer of security to avoid misuse by others
![image](https://hackmd.io/_uploads/H1iQSbqUA.png)
- Approved Chains: Allows you to limit chains that can be access via this App
![image](https://hackmd.io/_uploads/ByUHSZqUA.png)
- Allowed User Agents: Allows you to limit type of clients that can use this App
![image](https://hackmd.io/_uploads/Hy0UHZ5UC.png)
- Allowed Origins: Allows you to limit app urls that can make requests
![image](https://hackmd.io/_uploads/B1buBWcIR.png)
- Rate Limits: Allows you to limit number of requests for this app based on period
![image](https://hackmd.io/_uploads/BkoYSZcIR.png)