For Release
--------------
0. Enable prod falg = true
1. npm run build:android 
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
2. Delete all drawable-xx & raw in res
Release build (avoid Duplicate resources) :
https://shreyasnisal.medium.com/duplicate-resources-error-react-native-0-60-2200aa18d3e5
3. Build Check list For Android
----------------------------
    1. CodePushDeploymentKey - in android/app/main/res/values/strings.xml
    2. Version Code & Name

4. run the following command in terminal of /android
    cd android
    ./gradlew clean
    For APK - ./gradlew assembleRelease
    For AAP - ./gradlew bundleRelease
-------------------------------------------------------
If face any resource linking issues while release build
    npm run build:android 
    ./gradlew app:assembleRelease
=======================================================
yarn run bundle:ios
-------------------------------------------------------
react-native run-android
react-native run-android --variant=release

react-native run-ios --device "Udhayakumar's iPhone"
react-native run-ios --udid 00008030-0001492E3445402E
react-native run-ios --udid 00008030-0001492E3445402E -- configuration Release

Bundle setup
https://stackoverflow.com/questions/44103024/how-to-enable-google-play-app-signing
Play store console On the left menu, click Release > Setup > App integrity.

./gradlew bundleRelease


pod install
pod deintegrate

for arm64: arch -x86_64 


Clean and install
----------------
watchman watch-del-all && rm -rf node_modules && rm -rf yarn.lock && rm -rf package-lock.json && yarn cache clean && arch -x86_64 yarn 
&& 
cd ios 
&& 
rm -rf Pods && rm -rf Podfile.lock && arch -x86_64 pod install 
&& cd .. && 
cd android && ./gradlew clean 
&& 
cd .. && yarn start --reset-cache

npm start --reset-cache

arch -x86_64 yarn run ios
(or)
arch -x86_64 react-native run-ios

brew install cocoapods // To install compatible arch for m1
arch -x86_64 gem install ffi. // Install the ffi Ruby gem for Apple’s Rosetta 2
arch -x86_64 pod install
arch -x86_64 yarn run ios

for simple-toast: RCT_NEW_ARCH_ENABLED=1 pod install
RCT_NEW_ARCH_ENABLED=0 pod install -> finally ios worked for this command.

Pentest Build:
--------------
/network/apiConstants/inex.js
-> pentest = true;
-> prod = true
iOS : info.plist disable -> NSAppTransportSecurity
Android : MainActivity disable -> OkHttpClientProvider.setOkHttpClientFactory(new CustomNetworkModule());

1. React Native build unsigned apk without development server 
-------------------------------------------------------------
# create assets folder in the current project
$ mkdir android/app/src/main/assets

# create bundle script => npm run build:android
$ react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# execute command to run android to create debug apk
$ react-native run-android

# change to android folder
$ cd android

# build debug apk
$ ./gradlew assembleDebug

# install app
$ ./gradlew :app:installDebug
--------------------------------------------