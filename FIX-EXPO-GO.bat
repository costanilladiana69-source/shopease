// App.js
import React from 'react';
import { SafeAreaView, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{ fontSize: 20 }}>Expo Go Basic Test — App is running ✅</Text>
      </View>
    </SafeAreaView>
  );
}

