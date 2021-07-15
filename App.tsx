/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
//  import {
//    SafeAreaView,
//    ScrollView,
//    StatusBar,
//    StyleSheet,
//    Text,
//    useColorScheme,
//    View,
//  } from 'react-native';

import styled from 'styled-components/native';
import { startMock } from './server/MockServer';
const logoImage = require('./assets/2hireLogo/2hireLogo.png');

startMock();

const App = () => {
    return (
        <Container>
            <ImageContainer>
                <Logo source={logoImage} />
            </ImageContainer>
        </Container>
    );
};

const Container = styled.View`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ImageContainer = styled.View`
    width: 50%;
`;

const Logo = styled.Image`
    width: 100%;
    resize-mode: contain;
    overflow: hidden;
    border-radius: 800px;
`;

export default App;
