import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import InstallTabs from '../components/InstallButton/InstallTabs';
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <InstallTabs />
        <br />
        <Heading as='h2' className="hero_title">About <a href='https://skyhelper.xyz'>SkyHelper</a></Heading>
        <p>SkyHelper is a versatile Discord bot designed to enhance the <a href='https://thatskygame.com'>Sky: Children of the Light</a> gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky.</p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Utility package for SkyHelper Bot">
      <HomepageHeader />
    </Layout>
  );
}
