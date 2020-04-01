const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pacienteSchema = new Schema({
  nombre: { type: String, required: [true, "El	nombre	es	necesario"] },
  rut: { type: String, required:[true, "El rut es necesario"]},
  img: { type: String, required: false },
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
});

module.exports = mongoose.model("Paciente", pacienteSchema);