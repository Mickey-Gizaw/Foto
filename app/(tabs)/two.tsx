import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Photos } from '@/components/Photos';


export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Photos />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 4,
    width: '80%',
  },
});
