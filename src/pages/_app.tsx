/* eslint-disable import/order */
import '@fontsource/lexend/latin.css';
import 'styles/globals.css';

import Layout from 'components/layout';
import {AppProps} from 'next/app';
import Head from 'next/head';
// 1 Import MoralisProvider
import {MoralisProvider} from 'react-moralis';
import createEmotionCache from 'styles/createEmotionCache';
import customTheme from 'styles/customTheme';

/* eslint-disable react/jsx-props-no-spreading */
import {ChakraProvider} from '@chakra-ui/react';
import {EmotionCache} from '@emotion/cache';
import {CacheProvider} from '@emotion/react';

const clientSideEmotionCache = createEmotionCache();

// 2 Add secrets
const appId =
	process.env.NEXT_PUBLIC_APP_ID || 'xvfr1mIf4sIoCJozwCr19XhSkJr1mDPG9LP1JpCU';
const serverUrl =
	process.env.NEXT_PUBLIC_SERVER_URL ||
	'https://6czwazqjgerf.usemoralis.com:2053/server';

interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache;
}

const MyApp = ({
	Component,
	pageProps,
	emotionCache = clientSideEmotionCache,
}: MyAppProps) => {
	return (
		// 3 Wrap with MoralisProvider
		<MoralisProvider appId={appId} serverUrl={serverUrl}>
			<CacheProvider value={emotionCache}>
				<ChakraProvider theme={customTheme}>
					<Head>
						<meta
							name='viewport'
							content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
						/>
					</Head>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</ChakraProvider>
			</CacheProvider>
		</MoralisProvider>
	);
};

MyApp.defaultProps = {
	emotionCache: clientSideEmotionCache,
};

export default MyApp;
