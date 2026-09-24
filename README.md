# PINOLEROS AI — generación online en Cloudflare

La aplicación funciona con **Cloudflare Workers AI, D1 y R2**. No necesita un servidor
propio, Python, pesos descargados, una computadora encendida ni una clave de Gemini.

## Estudio creativo

`/crear` es una interfaz de conversación sin paneles laterales. Conserva el
estudio y la biblioteca privada. El compositor central incluye una imagen
adjunta opcional y parámetros desplegables: formato, resolución, estilo,
colores, modelo, semilla y selección de referencias. Los resultados se pueden
descargar, guardar o usar para pedir cambios. Las conversaciones permanecen
solo en memoria durante la visita (hasta 12 imágenes); guarda las imágenes que
quieras conservar en la biblioteca antes de recargar.

- FLUX.2 Klein 4B y SDXL generan y editan imágenes mediante Workers AI.
- La dirección creativa usa Llama para enriquecer el prompt respetando sus
  restricciones; puede desactivarse. Si falla, se utiliza el prompt original
  con una indicación en el resultado.
- Formatos 16:9, 9:16, 1:1, 4:5 y 3:2; hasta 1536 píxeles en el lado mayor.
- Referencias PNG/JPEG/WebP de hasta 10 MB se preparan como PNG de hasta 512
  píxeles. El servidor valida el formato y las dimensiones.
- La cuenta master abre **Referencias del master** desde el avatar. Puede
  subir hasta 100 ejemplos con imagen, prompt y palabras clave, activarlos,
  desactivarlos o eliminarlos. Se almacenan en R2/D1.
- La selección automática compara palabras del prompt con título, etiquetas
  y descripción de los ejemplos activos. Sin coincidencias no añade ejemplo.
  También se puede seleccionar uno manualmente o desactivar los ejemplos.
  La imagen y el prompt del ejemplo orientan la generación; una imagen
  adjunta del usuario tiene prioridad visual. El resultado identifica el
  ejemplo utilizado. Esto no entrena modelos ni implica aprendizaje autónomo.
- Hasta 10 intentos de imagen y 20 de dirección/mejora del prompt por cuenta
  y día UTC, contabilizados en D1. Los intentos fallidos también cuentan.
  No hay reintentos automáticos ni progreso de inferencia simulado.
- La biblioteca y sus imágenes permanecen privadas; solo se guardan los
  resultados elegidos por el usuario. Las funciones de administración y
  pedidos existentes siguen disponibles en el panel master.

## Publicar

Desde una terminal autenticada en la cuenta que contiene `pinoleros-ai-db` y
`pinoleros-creations`:

```sh
npm install
npx wrangler login
npm run check
npm test
npm run db:migrate:remote
npm run deploy
```

Aplica todas las migraciones pendientes, incluida `0011_creative_references.sql`, antes de publicar el nuevo estudio.
`wrangler.jsonc` conecta los recursos existentes y declara `ai.binding = "AI"`.
El binding autentica las peticiones a Workers AI dentro de Cloudflare; el navegador
no recibe tokens. Si Cloudflare solicita aceptar condiciones de un modelo, se gestionan
en el panel de esa cuenta. No se activa ningún plan de pago automáticamente.

Después de publicar, abre `/crear` en la URL que imprime Wrangler, inicia sesión,
y prueba una imagen con FLUX, una con referencia y una con SDXL. Las pruebas con
respuestas simuladas no sustituyen la verificación del acceso real de la cuenta.

## Cuota gratuita y límites

Workers AI ofrece 10,000 Neurons diarios sin cargo, compartidos por la cuenta y sus
modelos. En Workers Free, al agotar la cuota las operaciones fallan; en Workers Paid,
el exceso puede facturarse. Los límites de PINOLEROS son por usuario y NO garantizan
un límite de gasto global, porque otros usuarios y aplicaciones comparten la cuenta.
Para conservar el requisito de no pagar suscripción, usa el plan Free y supervisa la
cuota en Cloudflare. D1, R2 y Workers tienen sus propios límites de plataforma.

Fuentes oficiales verificadas:
- [Workers AI — precios](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [FLUX.2 Klein — binding, tamaños y referencias](https://developers.cloudflare.com/changelog/post/2026-01-15-flux-2-klein-4b-workers-ai/)
- [SDXL — parámetros](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-base-1.0/)

## Verificación y estructura

`npm test`: contratos de Workers AI, referencias, formatos, límites y almacenamiento.
`npm run check`: TypeScript y empaquetado sin publicación.
`npm run doctor`: estado de autenticación de Cloudflare.

`src/lib/cloud-images.ts` contiene los adaptadores de modelos; `src/routes/api/creations.ts`
los endpoints; `src/ui/studio.ts` el estudio; `migrations/` el esquema de D1.
Los trabajos del prototipo local están fuera de la aplicación, archivados en `tmp/`
y excluidos de Git y del despliegue. Ninguna ruta publicada los utiliza.

## Cuentas y recuperación de contraseña

Las cuentas se guardan en D1 con contraseñas derivadas mediante PBKDF2 y sal
individual. `/cuenta` permite cambiar la contraseña usando la actual, cerrar
sesión y generar un código de recuperación aleatorio de un solo uso. El usuario
debe guardar el código antes de olvidar su contraseña; solo su hash se almacena
en D1. Generar otro código reemplaza el anterior. Cambiar o recuperar la
contraseña invalida todos los códigos y sesiones de esa cuenta en la misma
operación de base de datos.

La recuperación requiere correo y código; no envía correos electrónicos. Las
cuentas existentes sin código deben entrar primero para generar uno. Si el
usuario perdió tanto la contraseña como el código, no hay recuperación autónoma
hasta configurar un servicio de correo y verificación de titularidad.

Aplica `0008_account_security.sql` antes de publicar. Los intentos de login,
cambio de contraseña y recuperación comparten límites de 20 por cuenta y 100
por IP por hora. `npm test` cubre almacenamiento, login, cambio de contraseña,
revocación de sesiones, códigos de un solo uso, límites y solicitudes de otro origen.

## Administración master

`/admin` permite a las cuentas master crear usuarios, editar nombre y teléfono,
asignar roles, suspender/reactivar cuentas, revocar sesiones y restablecer la
cuota diaria de IA. También permite consultar imágenes privadas, editar diseños
y su visibilidad, eliminarlos y gestionar productos/estados de pedidos.
Eliminar un diseño elimina sus pedidos asociados; el panel pide confirmación.
Los listados tienen páginas de 50 registros. Las contraseñas y códigos no se
incluyen en los listados.

Aplica `0010_admin_access.sql` antes del despliegue. Todos los endpoints verifican
la sesión y el rol en D1. Una cuenta suspendida no puede iniciar sesión; no se
permite quitar el último master activo ni retirar el propio acceso en el panel.
La gestión de infraestructura, facturación y proveedores externos se realiza en
sus respectivas cuentas de servicio.
