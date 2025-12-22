import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { usePhotosStore } from '@/store/usePhotosStore';

const styles = StyleSheet.create({
  scrollView: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 400,
    marginBottom: 15,
    resizeMode: 'contain',
  },
});

export default function imageScreen() {
  const photos = usePhotosStore((state) => state.photos);

  return (
    <View className='flex-1 p-10 bg-white'>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo.uri }}
            className='mb-4 w-72 h-96'            style={styles.image}
          />
        ))}
      </ScrollView>
    </View>
  );
}