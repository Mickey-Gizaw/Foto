import { useState, useEffect } from 'react';
import { Button, Dimensions, SafeAreaView, ScrollView, StyleSheet, Image, View, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from "@shopify/flash-list";
import { Text } from './Themed';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height


export function Photos() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
  const [album, setAlbum] = useState<MediaLibrary.Album | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      await requestPermission();
    }
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    setAlbums(fetchedAlbums);
    setAlbum(fetchedAlbums[0]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getAlbums} title="Get albums" />
      <ScrollView>
        {album && <AlbumEntry album={album} />}
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
    console.log("Befoe ", assets.length); // Log the result
    assets = assets.concat(result.assets);
    console.log("After ", assets.length); // Log the result
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
        <FlashList
          data={assets}
          numColumns={3}
          estimatedItemSize={600}
          inverted={true}
          renderItem={({ item, index }) => (
            <View style={styles.albumAssetsContainer}>
              <Image key={index} source={{ uri: item.uri }} width={133} height={130} />
            </View>
          )}
        />
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // height: height,
    width: width
  },
  albumContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
    width: width
  },
  albumAssetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'black',
  },
});
