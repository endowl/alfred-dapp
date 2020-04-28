# Alfred

Alfred is a decentralized crypto estate planner.

Over the next 40 years, the “Great Wealth Transfer” will see Millennials inherit somewhere between $60 and $70 Trillion dollars from Baby Boomers. Millennials increasingly recognize the long-term value of digital assets and embrace them as a part of their portfolio.

In a July 2019 survey from Bankrate, “Millennials picked cryptocurrencies as their top long-term investment about 9 percent of the time – about triple the rate of Generation X.” If and when Millennials *do* succeed in getting their parents and grandparents to invest in digital assets, the question will inevitably arise: "what happens to this cryptocurrency after I die?"

Website: 

## How it works
To secure your digital estate, simply create or sync a Gnosis Safe, designate your beneficiaries and how much of your assets they should receive, and set the check-in period on our decentralized dead man’s switch.

### Features

#### Create your estate
Alfred uses the Gnosis Safe contract proxy kit to let users create or sync their estate as part of a Gnosis Safe. The dApp uses transaction batching to create or sync the Gnosis Safe and set the owner as the individual deploying the transaction.

[Create estate screenshot](https://github.com/BatmansButler/alfred-dapp/images/.png)

#### Designate beneficiaries and their inheritance
Set the addresses you want to receive your assets and assign shares to allow them to claim their inheritance. The Gnosis Recovery Module lets you allow the executor and/or a set number of beneficiaries the ability to recover the Safe if needed.

Once you've deposited funds, use the Token Tracker on the Estate Dashboard to keep track of the value of your estate.

[Designate beneficiaries screenshot](https://github.com/BatmansButler/alfred-dapp/images/.png)

#### Generate proof-of-life using the decentralized dead man's switch
Set the number of days you want to go between checking in with Alfred and activate your estate plan with the flip of a switch. Providing proof-of-life is as simple as clicking the "Check-In" button on your Estate Dashboard.

[DMS screenshot](https://github.com/BatmansButler/alfred-dapp/images/.png)

#### Have we got your interest? Allow us to hodl it with RDai!
Support our work through direct donations OR stake with RDai and allow us to keep the interest to fund continued development *without* losing your assets.

[DMS screenshot](https://github.com/BatmansButler/alfred-dapp/images/.png)

## Warning
Alfred's code has NOT been audited. Until we can convince him a security audit *doesn't* involve the IRS, please don't deposit more funds than you're willing to lose.
___________________________________________________________________________________________________________________________

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
