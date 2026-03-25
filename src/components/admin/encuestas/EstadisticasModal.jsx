import { useState, useMemo } from "react";
import { FaTimes, FaChartBar, FaStar, FaCheckCircle, FaSpinner, FaSadTear, FaRegSmile, FaQuestionCircle, FaListUl, FaAlignLeft, FaFilter } from "react-icons/fa";
import CustomSelect from "../../ui/CustomSelect";

export default function EstadisticasModal({ abierto, onClose, encuestas, loading }) {
  if (!abierto) return null;

  const [filtroTipo, setFiltroTipo] = useState("");

  const encuestasFiltradas = useMemo(() => {
    if (!filtroTipo) return encuestas;
    return encuestas.filter(e => {
      const t = e.enTipo?.toUpperCase() || "";
      if (filtroTipo === "VENTA") return t.includes("VENTA") || t.includes("COMPRA");
      if (filtroTipo === "CITA") return t.includes("CITA");
      return true;
    });
  }, [encuestas, filtroTipo]);

  // Cálculos consolidados memorizados para eficiencia
  const stats = useMemo(() => {
    let toReturn = {
      total: encuestasFiltradas.length,
      promedioGeneral: 0,
      distribucionEstrellas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      siNo: { si: 0, no: 0 },
      totalEstrellasRespondidas: 0,
      comentarios: [],
      porPregunta: []
    };

    if (encuestasFiltradas.length === 0) return toReturn;

    let sumaEstrellas = 0;
    let encuestasConVotos = 0;
    let mapPreguntas = {};

    encuestasFiltradas.forEach(enc => {
      let tieneVoto = false;
      
      enc.respuesta_encuesta?.forEach(res => {
        const idPreg = res.pregunta?.idPregunta;
        if (!idPreg) return;
        
        if (!mapPreguntas[idPreg]) {
          mapPreguntas[idPreg] = {
            idPregunta: idPreg,
            texto: res.pregunta?.preTexto,
            tipo: res.pregunta?.preTipo,
            totalVotos: 0,
            datos: {}
          };
          if (res.pregunta?.preTipo === "estrellas") {
            mapPreguntas[idPreg].datos = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          } else if (res.pregunta?.preTipo === "si_no") {
            mapPreguntas[idPreg].datos = { si: 0, no: 0 };
          }
        }

        const ps = mapPreguntas[idPreg];
        const tipo = res.pregunta?.preTipo;
        const valor = res.resValor;

        if (tipo === "estrellas" && valor) {
          const v = parseInt(valor);
          if (!isNaN(v) && v >= 1 && v <= 5) {
            toReturn.distribucionEstrellas[v]++;
            sumaEstrellas += v;
            tieneVoto = true;

            ps.datos[v]++;
            ps.totalVotos++;
          }
        } else if (tipo === "si_no" && valor) {
          if (valor.toLowerCase().trim() === "sí" || valor.toLowerCase().trim() === "si") {
            toReturn.siNo.si++;
            ps.datos.si++;
            ps.totalVotos++;
          } else if (valor.toLowerCase().trim() === "no") {
            toReturn.siNo.no++;
            ps.datos.no++;
            ps.totalVotos++;
          }
        } else if (tipo === "texto" && valor && valor.trim() !== "N/A" && valor.trim() !== "") {
          toReturn.comentarios.push(valor);
          ps.datos[valor] = (ps.datos[valor] || 0) + 1;
          ps.totalVotos++;
        } else if (tipo === "seleccion" && valor) {
          const arr = valor.includes(",") ? valor.split(",").map(s => s.trim()) : [valor.trim()];
          arr.forEach(opt => {
              if (opt) {
                  ps.datos[opt] = (ps.datos[opt] || 0) + 1;
                  ps.totalVotos++;
              }
          });
        }
      });
      if (tieneVoto) encuestasConVotos++;
    });

    toReturn.totalEstrellasRespondidas = Object.values(toReturn.distribucionEstrellas).reduce((a,b) => a+b, 0);
    toReturn.promedioGeneral = toReturn.totalEstrellasRespondidas > 0 
      ? (sumaEstrellas / toReturn.totalEstrellasRespondidas).toFixed(1)
      : 0;

    toReturn.porPregunta = Object.values(mapPreguntas).sort((a,b) => b.totalVotos - a.totalVotos);

    return toReturn;
  }, [encuestasFiltradas]);

  const maxVotos = Math.max(...Object.values(stats.distribucionEstrellas), 1);
  const totalSiNo = stats.siNo.si + stats.siNo.no;
  const pctSi = totalSiNo > 0 ? (stats.siNo.si / totalSiNo) * 100 : 0;
  const pctNo = totalSiNo > 0 ? (stats.siNo.no / totalSiNo) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-7 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
              <FaChartBar className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Estadísticas Globales</h2>
              <p className="text-[10px] text-teal-300 font-mono tracking-[0.2em] opacity-80 uppercase">Consolidado de Satisfacción</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition cursor-pointer group">
            <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/80">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FaFilter className="text-teal-500" /> Filtro de Origen
            </h3>
            <div className="w-64 relative z-50">
              <CustomSelect
                value={filtroTipo}
                onChange={setFiltroTipo}
                placeholder="Todos los Formularios"
                options={[
                  { value: "", label: "Todos los Formularios" },
                  { value: "VENTA", label: "Solo Ventas Directas" },
                  { value: "CITA", label: "Solo Citas Médicas" }
                ]}
              />
            </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FaSpinner className="text-4xl animate-spin mb-4" />
                <p className="font-bold">Calculando estadísticas...</p>
             </div>
          ) : stats.total === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                 <FaSadTear className="text-5xl opacity-40" />
                 <p className="font-bold text-lg">Aún no hay encuestas registradas.</p>
                 {filtroTipo && <p className="text-sm">Prueba quitando el filtro de origen.</p>}
             </div>
          ) : (
             <div className="space-y-8">
                {/* Resumen Superior */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Muestras</p>
                        <p className="text-5xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-teal-500/20 text-white flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-100 mb-1">Satisfacción Promedio</p>
                            <h3 className="text-5xl font-black leading-none">{stats.promedioGeneral} <span className="text-2xl opacity-70">/ 5</span></h3>
                        </div>
                        <div className="flex text-4xl text-amber-300 drop-shadow-md">
                            {[1,2,3,4,5].map(i => (
                                <FaStar key={i} className={i <= Math.round(stats.promedioGeneral) ? 'opacity-100' : 'opacity-20'} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gráficos Detallados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gráfico de Barras Estrellas */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] mb-6">
                            <FaChartBar className="text-indigo-500" /> Distribución de Estrellas
                        </div>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(est => {
                                const votos = stats.distribucionEstrellas[est];
                                const pct = stats.totalEstrellasRespondidas > 0 ? (votos / stats.totalEstrellasRespondidas) * 100 : 0;
                                return (
                                    <div key={est} className="flex items-center gap-4 text-sm font-bold">
                                        <div className="flex items-center gap-1 w-12 text-slate-500 justify-end">
                                            {est} <FaStar className="text-amber-400 text-xs" />
                                        </div>
                                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden flex">
                                            <div 
                                              className="bg-indigo-500 transition-all duration-1000 ease-out rounded-full" 
                                              style={{ width: `${pct}%` }} 
                                            />
                                        </div>
                                        <div className="w-12 text-right text-slate-400 text-xs">{votos}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gráfico Sí/No */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] mb-6">
                            <FaCheckCircle className="text-emerald-500" /> Respuestas Dicotómicas (Sí / No)
                        </div>
                        <div className="flex justify-center flex-col items-center h-full pb-6 space-y-6">
                            {totalSiNo === 0 ? (
                                <p className="text-sm font-bold text-slate-400 text-center">Sin respuestas en estas métricas.</p>
                            ) : (
                                <>
                                    <div className="w-full flex justify-between px-2 text-sm font-black uppercase">
                                        <span className="text-emerald-500">Sí ({Math.round(pctSi)}%)</span>
                                        <span className="text-rose-500">No ({Math.round(pctNo)}%)</span>
                                    </div>
                                    <div className="w-full h-8 bg-rose-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200">
                                        <div 
                                            className="bg-emerald-500 transition-all duration-1000 h-full flex items-center justify-center text-white text-xs font-black shadow-[inset_-2px_0_5px_rgba(0,0,0,0.1)]"
                                            style={{ width: `${pctSi}%` }}
                                        >
                                            {pctSi >= 15 && <FaRegSmile />}
                                        </div>
                                        <div 
                                            className="bg-rose-500 transition-all duration-1000 h-full flex items-center justify-center text-white text-xs font-black"
                                            style={{ width: `${pctNo}%` }}
                                        >
                                            {pctNo >= 15 && <FaSadTear />}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 tracking-widest uppercase">Base: {totalSiNo} Respuestas</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Estadísticas por Pregunta Individual */}
                {stats.porPregunta.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                            Desglose Detallado por Pregunta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.porPregunta.map(preg => (
                                <TarjetaPregunta key={preg.idPregunta} pregunta={preg} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Nubes / Comentarios Recientes */}
                {stats.comentarios.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                         <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] mb-4">
                            Últimos Comentarios Destacados
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stats.comentarios.slice(-6).reverse().map((txt, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs italic font-medium text-slate-600">
                                    "{txt}"
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition shadow-xl cursor-pointer active:scale-95"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
}

function TarjetaPregunta({ pregunta }) {
  const { tipo, texto, totalVotos, datos } = pregunta;

  let icon = <FaQuestionCircle className="text-slate-400" />;
  if (tipo === "estrellas") icon = <FaStar className="text-amber-500" />;
  if (tipo === "si_no") icon = <FaCheckCircle className="text-emerald-500" />;
  if (tipo === "seleccion") icon = <FaListUl className="text-blue-500" />;
  if (tipo === "texto") icon = <FaAlignLeft className="text-purple-500" />;

  return (
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 mt-1">{icon}</div>
              <div className="flex-1">
                  <p className="font-bold text-slate-700 text-sm leading-tight">{texto}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      {totalVotos} Respuestas
                  </p>
              </div>
          </div>

          <div className="flex-1 max-h-48 overflow-y-auto custom-scrollbar pr-2 pb-2">
              {totalVotos === 0 ? (
                  <p className="text-xs text-slate-400 font-bold italic text-center py-4">No hay datos</p>
              ) : (
                  <div className="space-y-3">
                      {/* ESTRELLAS */}
                      {tipo === "estrellas" && (
                          [5, 4, 3, 2, 1].map(est => {
                              const votos = datos[est] || 0;
                              const pct = (votos / totalVotos) * 100;
                              return (
                                  <div key={est} className="flex items-center gap-3 text-xs font-bold">
                                      <div className="flex items-center gap-1 w-8 text-slate-500 justify-end">
                                          {est} <FaStar className="text-amber-400 text-[10px]" />
                                      </div>
                                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden flex">
                                          <div className="bg-amber-400 transition-all rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                      <div className="w-10 text-right text-slate-400">{Math.round(pct)}%</div>
                                  </div>
                              )
                          })
                      )}

                      {/* SI_NO */}
                      {tipo === "si_no" && (
                          <div className="flex justify-center flex-col items-center pt-2 space-y-3">
                              <div className="w-full flex justify-between px-1 text-xs font-black uppercase">
                                  <span className="text-emerald-500">Sí ({Math.round((datos.si / totalVotos) * 100)}%)</span>
                                  <span className="text-rose-500">No ({Math.round((datos.no / totalVotos) * 100)}%)</span>
                              </div>
                              <div className="w-full h-5 bg-rose-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200">
                                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(datos.si / totalVotos) * 100}%` }} />
                                  <div className="bg-rose-500 h-full transition-all" style={{ width: `${(datos.no / totalVotos) * 100}%` }} />
                              </div>
                          </div>
                      )}

                      {/* SELECCIÓN MÚLTIPLE */}
                      {tipo === "seleccion" && (
                          Object.entries(datos).sort((a,b) => b[1] - a[1]).map(([opcion, conteo]) => {
                              const pct = (conteo / totalVotos) * 100;
                              return (
                                  <div key={opcion} className="flex flex-col gap-1 text-[11px] font-bold">
                                      <div className="flex justify-between text-slate-600">
                                          <span className="truncate pr-2">- {opcion}</span>
                                          <span className="text-blue-600 font-extrabold">{Math.round(pct)}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                          <div className="bg-blue-500 transition-all rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                  </div>
                              )
                          })
                      )}
                      
                      {/* TEXTO LIBRE */}
                      {tipo === "texto" && (
                          <div className="space-y-2">
                              {Object.entries(datos).reverse().slice(0, 4).map(([txt, count], i) => (
                                  <div key={i} className="bg-slate-50 p-2 rounded-lg text-[10px] italic font-medium text-slate-600 border border-slate-100">
                                      "{txt}" {count > 1 && <span className="text-purple-500 font-bold ml-1">(x{count})</span>}
                                  </div>
                              ))}
                              {Object.keys(datos).length > 4 && (
                                  <p className="text-[10px] text-slate-400 font-bold text-center pt-1">+ {Object.keys(datos).length - 4} más</p>
                              )}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
  );
}
