import JSZip from "jszip";
import {BACKEND_FILES_URL, usePlayerRequest} from "./usePlayerRequest";
import {basePixiImports} from "../utils/scene/utils/import/import-pixi";

export const useUnpackLibrary = () => {
  const req = usePlayerRequest();

  return async e => {
    e.preventDefault();

    await req({method: "delete", path: "/clear-assets"});

    const [file] = e?.dataTransfer?.files ?? e?.target?.files;

    if (!file) return;

    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    return await new Promise(res => {
      reader.onload = async e => {
        const arrayBuffer = e.target.result;

        const formData = new FormData();
        formData.append("archive", file);

        const response = await fetch('/upload-asset.php', {
          method: 'PUT',
          body: formData,
        });
        console.log(response);
        debugger

        await req({method: "post", path: "/upload-archive", data: formData});

        const buffer = await JSZip.loadAsync(arrayBuffer);

        const files = buffer?.files;

        const [, jsFile] = Object.entries(files).find(([name]) => name.endsWith(".js"));

        const unpackedJsFile = await jsFile.async("string");

        window.data = {exports: null};
        const script = `(function (module){${unpackedJsFile}})(window.data)`;
        eval(script);
        const updatedScript = window.data.exports;

        for (const key in updatedScript.assets) updatedScript.assets[key] = `${BACKEND_FILES_URL}/${key}.json`;

        await basePixiImports();

        const library = await new Promise(res =>
          PIXI.animate.load(updatedScript, {
            loader: new PIXI.Loader(),
            complete() {
              updatedScript.setup(PIXI.animate);
              res(updatedScript);
            }
          }));

        res(library);
      };
    });
  };
};
