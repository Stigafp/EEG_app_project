import { View, Text, StyleSheet, ActivityIndicator} from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RouteProp, useRoute } from '@react-navigation/native'
import COLORS from '../constants/colors'


type ArticleWebViewParams = {
    ArticleWebView: {
      url: string;
      title?: string;
    };
};

type ArticleWebViewRouteProp = RouteProp<ArticleWebViewParams, "ArticleWebView">;

export default function ArticleWebViewScreen() {
    const route = useRoute<ArticleWebViewRouteProp>();
    const {url} = route.params;

  return (
    <SafeAreaView style={styles.screen}>
        <WebView
            source={{uri: url}}
            startInLoadingState={true}
            renderLoading={() => (
                <ActivityIndicator style={styles.loader} />
            )}
        />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    loader: {
        marginTop:30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});