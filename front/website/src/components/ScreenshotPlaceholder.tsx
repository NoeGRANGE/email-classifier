import React from 'react';
import styles from './ScreenshotPlaceholder.module.css';

export default function ScreenshotPlaceholder({text}) {
  return (
    <div className={styles.placeholder}>
      <p>{text}</p>
    </div>
  );
}
