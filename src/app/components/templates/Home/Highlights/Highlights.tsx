import styles from './Highlights.module.scss';
import { Section, H2, Grid } from '@elements';

export default function Highlights() {
  return (
    <Section>
      <H2
        className={styles.headline}
        eyebrow="Section headline"
      >
        Vestibulum nec nulla rutrum nine years semper. Donec quis orci maximus,
        efficitur quam.
      </H2>
      <Grid className={styles.itemsWrapper}>
        <div className={styles.item}>
          <h3>Accessibility headline</h3>
          <p>
            Vestibulum nec nulla rutrum nine years semper. Donec quis orci
            maximus, efficitur quam nulla rutrum quis.
          </p>
        </div>

        <div className={styles.item}>
          <h3>Accessibility headline</h3>
          <p>
            Vestibulum nec nulla rutrum nine years semper. Donec quis orci
            maximus, efficitur quam nulla rutrum quis.
          </p>
        </div>

        <div className={styles.item}>
          <h3>Accessibility headline</h3>
          <p>
            Vestibulum nec nulla rutrum nine years semper. Donec quis orci
            maximus, efficitur quam nulla rutrum quis.
          </p>
        </div>

        <div className={styles.item}>
          <h3>Accessibility headline</h3>
          <p>
            Vestibulum nec nulla rutrum nine years semper. Donec quis orci
            maximus, efficitur quam nulla rutrum quis.
          </p>
        </div>
      </Grid>
    </Section>
  );
}
