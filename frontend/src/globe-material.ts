import * as THREE from "three";
import { BASE } from "@/src/api";
import { colors } from "@/src/theme";

export function earthMaterial() {
  const placeholder = new THREE.DataTexture(new Uint8Array([12, 24, 38, 255]), 1, 1, THREE.RGBAFormat);
  placeholder.needsUpdate = true;
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: placeholder },
      uOcean: { value: new THREE.Color(colors.ocean) },
      uLand: { value: new THREE.Color(colors.globeLand) },
      uRim: { value: new THREE.Color(colors.atmosphere) },
      uCities: { value: new THREE.Color(colors.globeLand) },
    },
    vertexShader: `varying vec3 vLocal; varying vec3 vN;
      void main(){vLocal=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uOcean; uniform vec3 uLand; uniform vec3 uRim; uniform vec3 uCities;
      varying vec3 vLocal; varying vec3 vN;
      void main(){
        vec3 p=normalize(vLocal);
        vec2 uv=vec2(0.5+atan(p.x,p.z)/6.2831853,0.5-asin(p.y)/3.1415927);
        vec4 sampleMap=texture2D(uMap,uv);
        vec3 terrain=sampleMap.rgb;
        float l=dot(terrain,vec3(0.299,0.587,0.114));
        float sea=smoothstep(0.015,0.12,terrain.b-terrain.r);
        float land=1.0-sea;
        float relief=l-dot(texture2D(uMap,uv+vec2(0.00065,0.00065)).rgb,vec3(0.299,0.587,0.114));
        vec3 n=normalize(vN);
        float light=0.2+0.8*max(0.0,dot(n,normalize(vec3(-0.35,0.85,0.55))));
        vec3 ground=uLand*max(0.03,0.1+l*0.8+relief*4.5);
        vec3 col=mix(uOcean,ground,land)*light;
        float rim=pow(1.0-max(n.z,0.0),4.0);
        col+=uRim*rim*0.28;
        col+=uCities*pow(sampleMap.a,1.15)*1.1;
        gl_FragColor=vec4(col,1.0);
      }`,
  });
}

let pixels: Promise<ArrayBuffer> | undefined;
export async function loadEarthTexture(material: any, isDisposed: () => boolean) {
  pixels ??= fetch(`${BASE}/brand/earth?v=2`).then((response) => {
    if (!response.ok) throw new Error("Earth texture unavailable");
    return response.arrayBuffer();
  }).catch((error) => { pixels = undefined; throw error; });
  const bytes = await pixels;
  if (isDisposed()) return;
  if (bytes.byteLength !== 1536 * 768 * 4) throw new Error("Invalid Earth texture");
  const texture = new THREE.DataTexture(new Uint8Array(bytes), 1536, 768, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  material.uniforms.uMap.value.dispose();
  material.uniforms.uMap.value = texture;
}