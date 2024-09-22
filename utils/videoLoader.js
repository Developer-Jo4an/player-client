import {useCallback, useEffect, useMemo, useState} from "react";

const cache = {};
const {URL} = global;

export default function videoLoader(url) {
  if (!url) return;
  if (!cache[url]) {
    cache[url] = fetch(url)
      .then(response => response.blob())
      .then(blob => URL.createObjectURL(blob))
      .catch(() => url);
  }

  return cache[url];
}

export function audioLoader(url) {
  if (!url) return;
  if (!cache[url]) {
    cache[url] = fetch(url, {headers: {"Range": "0-"}})
      .then(response => response.blob())
      .then(blob => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          reader.onerror = (e) => {
            reject(e)
          };
          reader.readAsDataURL(blob);
        })
      })
      .catch(() => url);
  }

  return cache[url];
}

export async function videoLoaderPreload(list) {
  for (const itm of list) {
    try {
      await videoLoader(itm?.src);
    } catch (e) {

    }
  }
}

const SEQUENCE = "sequence";
const PARALLEL = "parallel";

export function useVideoLoaderMap(urls, type = SEQUENCE) {
  const {keys, values} = useMemo(() => {
    const keys = Object.keys(urls);
    const values = keys.map(k => urls[k]);
    return {keys, values};
  }, []);
  const videos = useVideoLoader(values);
  return useMemo(() => {
    return videos.reduce((res, v, i) => {
      res[keys[i]] = v;
      return res;
    }, {});
  }, [videos, keys]);
}

export function useVideoLoader(urls, type=SEQUENCE) {
  const [videos, setVideos] = useState([]);
  const addVideo = useCallback(
    (i, blob) => {
      setVideos(list => [...list.slice(0, i), blob, ...list.slice(i)])
    },
    []
  );

  useEffect(() => {
    let active = true;
    async function make() {
      for (let i = 0; i < urls.length; i++) {
        const blobUrl = await videoLoader(urls[i]);
        if (active) addVideo(i, blobUrl);
        else break;
      }
    }
    make().catch(() => {});
    return () => {
      active = false;
    }
  }, urls);

  return videos;
}
