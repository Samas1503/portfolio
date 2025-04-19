CREATE TABLE `Contacto` (
	`id` integer,
	`nombre` text,
	`titulo` text,
	`link` text,
	`icono` text,
	`estado` integer
);
--> statement-breakpoint
CREATE TABLE `Experiencia` (
	`id` integer,
	`empresa` text,
	`cargo` text,
	`fecha_inicio` text,
	`fecha_fin` text,
	`ubicacion` text,
	`latitud` real,
	`longitud` real,
	`nombre_referencia` text,
	`nro_referencia` integer,
	`estado` integer
);
--> statement-breakpoint
CREATE TABLE `Proyectos` (
	`id` integer,
	`titlo` text,
	`imagen` text,
	`url_github` text,
	`url_demo` text,
	`estado` integer
);
--> statement-breakpoint
CREATE TABLE `Servicios` (
	`id` integer,
	`tipo` text,
	`icono` text,
	`nombre` text,
	`estado` integer
);
--> statement-breakpoint
CREATE TABLE `Skills` (
	`id` integer,
	`tipo` text,
	`nombre` text,
	`nivel` text,
	`valor` integer,
	`estado` integer
);
