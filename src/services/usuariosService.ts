export type TipoUsuarioLogin = {
	nombre: string;
	rutaLogin: string;
	tipo: string;
};

const tiposUsuarioLoginMock: TipoUsuarioLogin[] = [
	{
		nombre: "Aspirante",
		rutaLogin: "/aspirante/login",
		tipo: "aspirante",
	},
	{
		nombre: "Facultad",
		rutaLogin: "/facultad/login",
		tipo: "facultad",
	},
	{
		nombre: "Programa",
		rutaLogin: "/programa/login",
		tipo: "programa",
	},
];

export async function obtenerTiposUsuarioLogin() {
	return tiposUsuarioLoginMock;
}
