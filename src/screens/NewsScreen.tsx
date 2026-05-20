import { View, Text, Animated, ActivityIndicator, StyleSheet, FlatList} from 'react-native'
import React, { useEffect, useState } from 'react'
import { NewsArticle } from '../type/article'
import { getNewsArticles } from '../services/newsClient'
import { ArticleCard } from '../components/ArticleCard'
import COLORS from '../constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

const PAGE_SIZE = 8;

export default function NewsScreen({navigation, onScroll}: any) {

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadArticles(pageToLoad: number) {
    if(loadingMore || (pageToLoad !== 1 && !hasMore)) return;

    pageToLoad === 1 ? setInitialLoading(true) : setLoadingMore(true);

    try{
      const data= await getNewsArticles(pageToLoad, PAGE_SIZE);

      setArticles(prev =>
        pageToLoad === 1
          ? data.articles 
          : [...prev, ...data.articles],
      );

      setPage(pageToLoad);
      setHasMore(data.hasMore);
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadArticles(1);
  }, []);

  if(initialLoading){
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      
      <FlatList
        data={articles}
        keyExtractor={item => item.url}
        contentContainerStyle={styles.list}
        renderItem={({item}) => <ArticleCard article={item} />}
        onEndReached={() => loadArticles(page + 1)}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Nyt om epilepsi, EEG og hjerneforskning</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.footer}/> : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  heading: {
    fontSize: 26,
    marginTop: 70,
    marginBottom: 20,
    fontWeight: "700",
    color: COLORS.primus,
  },
  footer: {
    marginVertical: 24,
  },
});