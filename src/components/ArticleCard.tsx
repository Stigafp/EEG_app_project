import { View, Text, Image, Pressable, StyleSheet, Linking} from 'react-native'
import React from 'react'
import { NewsArticle } from '../type/article'
import { useNavigation } from '@react-navigation/native'
import COLORS from '../constants/colors'

type Props = {
    article: NewsArticle;
};

export function ArticleCard({article}: Props) {
   // const navigation = useNavigation<any>();
    const openArticle = () => {
        Linking.openURL(article.url);
    };

  return (
    <Pressable 
        style={styles.cardContainer} onPress={openArticle}>
        {article.image && (
           <Image source={{ uri: article.image }} style={styles.image} />
        )}

        <View style={styles.content}>
            <View style={styles.metaRow}>
                <Text style={styles.source}>{article.source}</Text>
                <Text style={styles.date}>{article.publishedDate}</Text>
            </View>
            <Text style={styles.title}>{article.title}</Text>
            <Text style={styles.summary}>{article.summary}</Text>

            <Text style={styles.readMore}>Læs artikel</Text>
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        padding: 16,
        marginBottom: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    image: {
        width: "100%",
        height: 150,
    },
    content: {
        padding: 16,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    source: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.red,
    },
    date: {
        fontSize: 12,
        color: COLORS.gray,
    },
    title: {
        fontSize: 18,
        color: COLORS.black,
        fontWeight: "700",
        marginBottom: 8,
    },
    summary: {
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 10,
        lineHeight: 20,
    },
    readMore: {
        fontSize: 14,
        marginTop: 12,
        color: COLORS.primus,
        fontWeight: "700",
    },
});