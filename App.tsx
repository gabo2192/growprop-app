/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import messaging from '@react-native-firebase/messaging';

import React, {createRef, useEffect, useState} from 'react';
import {NativeSyntheticEvent} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {WebViewMessage} from 'react-native-webview/lib/WebViewTypes';
import {update} from './lib/user';

function App(): JSX.Element {
  const [token, setToken] = useState<null | string>(null);
  const [_key, setKey] = useState(0);
  const [deviceToken, setDeviceToken] = useState<null | string>(null);

  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
      console.log('Permission status:', authorizationStatus);
      const t = await messaging().getToken();

      setDeviceToken(t);
    }
  }
  let webViewRef = createRef<WebView>();

  // const [cookies, setCookies] = useState<CookiesType>(null);

  // const isLoggedIn = !!cookies?.token;
  const INJECTED_JAVASCRIPT = `window?.ReactNativeWebView.postMessage("Cookie: " + document.cookie);
  true;
`;
  const onNavigationStateChange = async (
    navigationState: WebViewNavigation,
  ) => {
    if (navigationState.url.includes('login')) {
      setToken(null);
      await messaging().deleteToken();
      const t = await messaging().getToken();
      setDeviceToken(t);

      return;
    }
    console.log({url: navigationState.url});
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
    }
  };

  const onMessage = (event: NativeSyntheticEvent<WebViewMessage>) => {
    const {data} = event.nativeEvent;
    if (data.includes('Cookie:')) {
      const cookies = data.split(';');

      const tokenCookie = cookies.find(i => i?.includes('token'));
      const t = tokenCookie?.replace('token=', '').trim();
      if (t) {
        setToken(t);
        setKey(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    const updateUser = async ({t, d}: {t: string; d: string}) => {
      await update({
        token: t,
        data: {token: d},
      });
    };
    console.log({_key});
    if (token && deviceToken) {
      updateUser({t: token, d: deviceToken});
    }
  }, [token, deviceToken, _key]);

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
  }, []);

  return (
    <WebView
      source={{uri: 'https://app.growproexperience.tech/'}}
      style={{marginTop: 20}}
      onNavigationStateChange={onNavigationStateChange}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      ref={webViewRef}
      onMessage={onMessage}
    />
  );
}

export default App;
