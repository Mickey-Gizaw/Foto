import { useState } from 'react';
import { Button, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, View, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from "@shopify/flash-list";

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

async function getAllAssets(): Promise<MediaLibrary.Asset[]> {
  let assets: MediaLibrary.Asset[] = [];
  let hasNextPage = true;
  let cursor: MediaLibrary.AssetRef | undefined = undefined

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      first: 100, // Fetch 100 assets per page
      after: cursor,
      mediaType: ['photo', 'video' ]
    });

    assets = assets.concat(result.assets);
    hasNextPage = result.hasNextPage;
    cursor = result.endCursor;
  }

  return assets;
}

export function Photos() {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  async function getPhotos() {
    if (permissionResponse?.status !== 'granted') {
      await requestPermission();
    }
    const assets = await getAllAssets();
    setAssets(assets);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getPhotos} title="Get photos" />
      <ScrollView>
        <AlbumEntry assets={assets}/>
      </ScrollView>
    </SafeAreaView>
  );
}

function AlbumEntry({ assets } : { assets: MediaLibrary.Asset[]}) {
  return (
    <View style={styles.albumContainer}>
      <ScrollView>
        <View style={{minHeight: height}}>
          <FlashList
              data={assets}
              numColumns={3}
              estimatedItemSize={600}
              renderItem={({ item }) => (
                <View style={styles.albumAssetsContainer}>
                 <Image style={styles.image} key={item.id} source={{ uri: item.uri }}/>
                </View>
              )}
            />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingTop: 40
      }
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    minHeight: height,
    width: width,
  },
  albumContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
    width: width,
  },
  albumAssetsContainer: {
    borderWidth: 2,
    borderColor: 'black',
  },
  image: {
    width: 133,
    height: 130,
  },
});
