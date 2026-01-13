import styles from "./DefaultLoader.module.scss";

export default function DefaultLoader() {
  return (
    <div className={styles.page}>
      <div className={styles.loader} />
    </div>
  );
}
