import { useState, useEffect } from 'react';
import { Button, Dimensions, SafeAreaView, ScrollView, StyleSheet, Image, View, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from "@shopify/flash-list";
import { Text } from './Themed';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height


export function Photos() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      await requestPermission();
    }
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    setAlbums(fetchedAlbums);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getAlbums} title="Get albums" />
      <ScrollView>
        {albums && albums.map((album, index) => <AlbumEntry album={album} key={index}/>)}
      </ScrollView>
    </SafeAreaView>
  );
}

async function getAllAssets(album: MediaLibrary.Album): Promise<MediaLibrary.Asset[]> {
  let assets: MediaLibrary.Asset[] = [];
  let hasNextPage = true;
  let cursor: MediaLibrary.AssetRef | undefined = undefined

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      first: 100, // Fetch 100 assets per page
      album: album,
      after: cursor,
    });

    assets = assets.concat(result.assets);
    hasNextPage = result.hasNextPage;
    cursor = result.endCursor;
  }

  return assets;
}

function AlbumEntry({ album } : { album: MediaLibrary.Album}) {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    async function getAlbumAssets() {
      const albumAssets = await getAllAssets(album);
      setAssets(albumAssets);
    }
    getAlbumAssets();
  }, [album]);

  return (
    <View key={album.id} style={styles.albumContainer}>
      <ScrollView>
        <Text style={styles.title}> {album.title} </Text>
        <View style={{minHeight: height}}>
          <FlashList
              data={assets}
              numColumns={3}
              estimatedItemSize={600}
              renderItem={({ item }) => (
                <View style={styles.albumAssetsContainer}>
                  <Image key={item.id} source={{ uri: item.uri }} width={133} height={130} />
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
});
