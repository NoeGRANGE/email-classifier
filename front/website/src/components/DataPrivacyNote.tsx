import React from 'react';
import styles from './DataPrivacyNote.module.css';

export default function DataPrivacyNote({children}) {
  return (
    <div className={styles.note}>
      <p>{children}</p>
    </div>
  );
}
