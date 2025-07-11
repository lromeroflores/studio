
import type { ContractTemplate, ContractCell } from '@/components/contract/types';

export const defaultTemplates: ContractTemplate[] = [
  {
    id: 'credito-v1',
    name: 'Contrato de Apertura de Crédito',
    description: 'Un contrato de apertura de crédito con obligación solidaria.',
    fields: [
      { id: 'DIA_FIRMA', label: 'Día de Firma', type: 'text', placeholder: 'Ej: 01', required: true },
      { id: 'MES_FIRMA', label: 'Mes de Firma', type: 'text', placeholder: 'Ej: Enero', required: true },
      { id: 'AÑO_FIRMA', label: 'Año de Firma', type: 'text', placeholder: 'Ej: 2024', required: true },
      { id: 'NOMBRE_DE_LA_ACREDITADA', label: 'Nombre del Acreditado', type: 'text', required: true },
      { id: 'NOMBRE_OBLIGADOS_SOLIDARIOS', label: 'Nombre(s) de Obligado(s) Solidario(s)', type: 'textarea', required: true },
      { id: 'APODERADO_COVALTO', label: 'Apoderado Legal de Covalto', type: 'text', required: true },
      { id: 'TIPO_ACREDITADO', label: 'Tipo de Acreditado', type: 'text', placeholder: 'Persona Moral o Persona Fisica', required: true },
      { id: 'TIPO_OBLIGADO_SOLIDARIO', label: 'Tipo de Obligado Solidario', type: 'text', placeholder: 'Persona Moral o Persona Fisica', required: true },
    ],
    generateCells: (formData): ContractCell[] => {
      const data = {
        DIA_FIRMA: '[DIA_FIRMA]',
        MES_FIRMA: '[MES_FIRMA]',
        AÑO_FIRMA: '[AÑO_FIRMA]',
        NOMBRE_DE_LA_ACREDITADA: '[NOMBRE DE LA ACREDITADA]',
        NOMBRE_OBLIGADOS_SOLIDARIOS: '[NOMBRE OBLIGADOS SOLIDARIOS]',
        APODERADO_COVALTO: '[APODERADO COVALTO]',
        TIPO_ACREDITADO: 'Persona Moral', // Default value
        TIPO_OBLIGADO_SOLIDARIO: 'Persona Moral', // Default value
        ...formData,
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') {
            return '';
        }
        return `<strong style="color: red;">${String(text)}</strong>`;
      };
      
      const declaracionesAcreditadoMoral = `
(a) Es una sociedad debidamente constituida y existente conforme a las leyes de México, según como se relaciona en el inciso II del Anexo A.
(b) Su(s) representante(s) cuenta(n) con las facultades suficientes y necesarias para celebrar el presente Contrato de Crédito, como se relaciona en el inciso II del Anexo A, mismas que no le han sido revocadas, limitadas o modificadas en forma alguna a la fecha de firma de este documento. 
(c) Que cuenta con la capacidad suficiente para desarrollar sus negocios a lo largo de toda la República Mexicana, con domicilio fiscal y con Registro Federal de Contribuyentes relacionados en el inciso II del Anexo A.
(d) 	La suscripción, entrega y cumplimiento del presente instrumento y de cualquier otro documento o título de crédito que el Acreditado deba suscribir conforme al mismo está comprendido dentro de su objeto social, ha sido debidamente autorizado por sus Accionistas o socios y por todos los órganos corporativos correspondientes y no viola: (i) sus estatutos vigentes a la fecha de este documento; ni (ii) ley o disposición normativa o contractual alguna que le obligue o afecte.
(e) Que actúa en nombre y para beneficio de su representada y no para terceras personas y no existe propietario real distinto al de las personas que ejercen el control según consta en la documentación proporcionada al Banco, que los recursos con los que su representada hará frente a las obligaciones de pago que deriven a su cargo con motivo del presente Contrato son y serán propios y de procedencia lícita, y son producto de su actividad comercial lícita.
      `.trim();

      const declaracionesAcreditadoFisica = `
(a) Es una persona física, con capacidad legal suficiente para obligarse en los términos y condiciones del presente Contrato de Crédito y comparece por su propio derecho.
(b) Actúa por cuenta propia y no a favor de terceros, cuyos generales se relacionan en el inciso II del Anexo A.
(c) Que cuenta con la capacidad suficiente para desarrollar sus negocios a lo largo de toda la República Mexicana, con domicilio fiscal y con Registro Federal de Contribuyentes relacionados en el inciso II del Anexo A.
(d) 	La suscripción, entrega y cumplimiento del presente instrumento y de cualquier otro documento o título de crédito que el Acreditado deba suscribir conforme al mismo no viola ley o disposición normativa o contractual alguna que le obligue o afecte.
(e) Que actúa en nombre y para beneficio propio y no para terceras personas, que los recursos con los que hará frente a las obligaciones de pago que deriven a su cargo con motivo del presente Contrato son y serán propios y de procedencia lícita, y son producto de su actividad comercial lícita.
      `.trim();
      
      const declaracionesAcreditadoContent = data.TIPO_ACREDITADO === 'Persona Moral' 
        ? declaracionesAcreditadoMoral 
        : declaracionesAcreditadoFisica;

      const declaracionesObligadoSolidarioFisica = `
(a) Es (Son) una persona(s) física(s), con capacidad legal suficiente para obligarse en los términos y condiciones del presente Contrato de Crédito y comparece(n) por su propio derecho, por cuenta propia y no a favor de terceros, cuyos generales se relacionan en el inciso III del Anexo A.
      `.trim();

      const declaracionesObligadoSolidarioMoral = `
(a.1) Es una sociedad debidamente constituida y existente conforme a las leyes de México, según como se relaciona en el inciso III del Anexo A.
(a.2) Su(s) representante(s) cuenta(n) con las facultades suficientes y necesarias para celebrar el presente Contrato de Crédito, como se relaciona en el inciso III del Anexo A, mismas que no le han sido revocadas, limitadas o modificadas en forma alguna a la fecha de firma de este documento.
(a.3) Que cuenta con la capacidad suficiente para desarrollar sus negocios a lo largo de toda la República Mexicana, con domicilio fiscal y con Registro Federal de Contribuyentes relacionados en el inciso III del Anexo A.
(a.4) Su objeto social permite expresamente obligarse solidariamente y garantizar obligaciones de terceros.
(a.5) La suscripción, entrega y cumplimiento del presente instrumento y de cualquier otro documento o título de crédito que el Obligado Solidario deba suscribir conforme al mismo, está comprendido dentro de su objeto social, ha sido debidamente autorizado por sus accionistas o socios y por todos los órganos corporativos correspondientes y no viola: (i) sus estatutos vigentes a la fecha de este documento; ni (ii) ley o disposición normativa o contractual alguna que le obligue o afecte.
(a.6) Está de acuerdo en obligarse solidariamente con el Acreditado al cumplimiento y pago exacto y puntual de las obligaciones que le derivan a éste del presente instrumento le reporta un beneficio al Obligado Solidario en razón de la relación corporativa, patrimonial y/o comercial que mantiene con el Acreditado.
      `.trim();

      const declaracionesObligadoSolidarioContent = data.TIPO_OBLIGADO_SOLIDARIO === 'Persona Moral'
        ? declaracionesObligadoSolidarioMoral
        : declaracionesObligadoSolidarioFisica;

      const declaracionesAmbasPersonasObligadoSolidario = `
(b) Es su voluntad celebrar el presente Contrato en su carácter de Obligado Solidario.
(c) Tiene su domicilio, para efectos de la Cláusula Vigésima Cuarta de este instrumento, en el indicado en el inciso III del Anexo A.
(d) La información legal y financiera y demás información proporcionada por el Obligado Solidario al Acreditante es verdadera, correcta y vigente.
(e) Es su intención obligarse solidariamente con el Acreditado al cumplimiento y pago exacto y puntual de todas y cada una de las obligaciones que derivan al Acreditado del presente instrumento y de los demás Documentos del Crédito, incluyendo, sin limitar, el pago exacto y puntal de la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito.
(f) En su caso, pagará la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito con recursos de procedencia lícita.
(g) No existe reclamación ni disputa ni amenaza de reclamación o disputa en su contra o en contra de cualquiera de sus propiedades, ante tribunal, dependencia gubernamental o árbitro alguno, que pudiera afectar la legalidad, validez o exigibilidad de este instrumento, su condición financiera o su capacidad de pagar la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito.
(h) No se encuentra en incumplimiento legal o contractual cualquiera que pudiera afectar la legalidad, validez o exigibilidad de este instrumento, su condición financiera o su capacidad de pagar la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito.
(i) El otorgamiento del presente instrumento no contraviene, ni resulta en incumplimiento de: (i) cualquier ley, reglamento, decreto o autorización (incluyendo licencias o concesiones) aplicables en su caso; o, (ii) cualquier contrato o convenio de cualquier naturaleza, respecto del cual sea parte.
(j) Se encuentra al corriente en el pago de las obligaciones legales, fiscales y contractuales a su cargo cuyo incumplimiento pudiera afectar en forma adversa su situación financiera y capacidad de pago, incluyendo, entre otras, el pago de Impuestos (como dicho término se define más adelante), las contribuciones a su cargo, pago de cuotas obrero-patronales, aportaciones al Instituto del Fondo Nacional de la Vivienda para los Trabajadores, al Sistema de Ahorro para el Retiro y/o al Instituto Mexicano del Seguro Social, de manera respectiva, y el cumplimiento de la legislación laboral aplicable en México.
(k) No se encuentra en procedimiento judicial o extrajudicial de insolvencia, concurso, reestructura o reorganización alguna.
(l) No requiere autorización, aprobación, registro u otro acto de, o ante, cualquier autoridad gubernamental de México o de cualquier otra jurisdicción que le sea aplicable para la suscripción, entrega y cumplimiento del presente instrumento y de cualquier otro documento que deba suscribir conforme al mismo.
(m) A la fecha de este instrumento, sus empleados no se encuentran en huelga ni tiene conocimiento de que exista emplazamiento a huelga o que pretenda presentarse dicho emplazamiento por parte de sus trabajadores o por parte de cualquier sindicato o asociación.
(n) Las obligaciones que asume conforme a este instrumento y demás Documentos del Crédito constituyen obligaciones legales y válidas.
(o) Previo a la firma de este instrumento, el Acreditante puso a su disposición y le explicó inequívocamente el contenido y alcance legal de su “Aviso de Privacidad”, vigente a la fecha de firma de este instrumento, manifestando al respecto el Obligado Solidario estar de acuerdo con el tratamiento que el Acreditante da y dará a sus datos personales en cumplimiento a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y reconociendo que dicho “Aviso de Privacidad” podrá cambiar de tiempo en tiempo y podrá ser consultado por éste en el portal de Internet del Acreditante, mismo que, al momento de la firma, consultó en el siguiente enlace “https://covalto.com/privacidad/#info”.
(p) Conoce la situación sanitaria y económica derivada de la pandemia “COVID-19”, por lo que desarrollo e implementó una estrategia general de negocio conducente. En este sentido, no podrá alegar caso fortuito o fuerza mayor derivada de la situación sanitaria antes mencionada -o sus efectos o consecuencias- para incumplir a las obligaciones contraídas al amparo del Contrato de Crédito, de conformidad con lo dispuesto en la Cláusula Vigésima Quinta.
(q) Previo a la firma del presente Contrato, el Obligado Solidario realizó la gestión necesaria para dar de alta su firma electrónica avanzada consistente en el conjunto de datos y caracteres que permite la identificación del firmante, que ha sido creada por medios electrónicos bajo su exclusivo control, de manera que está vinculada únicamente al mismo y a los datos a los que se refiere, lo que permite que sea detectable cualquier modificación ulterior de éstos, la cual produce los mismos efectos jurídicos que la firma autógrafa (la “FIEL”) misma que se podrá utilizar, en este contrato como su firma electrónica, que consiste en los datos en forma electrónica consignados en un mensaje de datos, o adjuntados o lógicamente asociados al mismo, que son utilizados para identificar al firmante en relación con el Mensaje de Datos e indicar que el firmante aprueba la información contenida en el mensaje de datos, y que produce los mismos efectos jurídicos que la firma autógrafa, siendo inclusive admisible como prueba en juicio (la “Firma Electrónica”) para la formalización del presente Contrato, la Solicitud de Disposición del Crédito, el Pagaré y demás Documentos del Crédito. Es uno de los motivos determinantes de la voluntad de las Partes reconocer que el presente Contrato se podrá celebrar mediante Firma Electrónica y que en dado caso tendrá la misma validez y eficacia como si hubiese sido celebrado con firma autógrafa.
(r) Tiene pleno conocimiento del alcance, forma de uso y características de una Firma Electrónica. Adicionalmente y de manera personal realizó todas las gestiones para dar de alta su firma electrónica avanzada y es el único usuario y responsable de la misma, por lo que no podrá alegar mal uso de esta por un tercero y por consecuencia no podrá, sin incurrir en responsabilidad penal, negar la firma del presente Contrato y/o cualquier Anexo.
      `.trim();


      const cells = [
        {
          title: 'Titulo y descripcion',
          content: `<div class="text-center">CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA<br /><br />de fecha ${styleVar(data.DIA_FIRMA)} de ${styleVar(data.MES_FIRMA)} de ${styleVar(data.AÑO_FIRMA)}<br /><br />que celebran<br /><br /><br />${styleVar(data.NOMBRE_DE_LA_ACREDITADA)}<br /><br />como Acreditado <br /><br /><br />BANCO COVALTO, S.A. INSTITUCIÓN DE BANCA MÚLTIPLE<br /><br />como Acreditante y<br /><br /><br />${styleVar(data.NOMBRE_OBLIGADOS_SOLIDARIOS)}<br /><br />como Obligados Solidarios</div>`,
        },
        {
          title: 'Inicio',
          content: `EL CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA (el “Contrato de Crédito”) que celebran por una parte BANCO COVALTO, SOCIEDAD ANÓNIMA INSTITUCIÓN DE BANCA MÚLTIPLE, representada por su apoderado legal, el señor ${styleVar(data.APODERADO_COVALTO)} como Acreditante (el “Acreditante” y/o el “Banco”) con el Acreditado y Obligado(s) Solidario(s) especificados en el Anexo A, en su conjunto identificados como las Partes (las “Partes”); al tenor de las siguientes declaraciones y cláusulas:<br />------------------------------------------------- DECLARACIONES<br />I. Declaraciones del Acreditante. Declara “BANCO COVALTO”, SOCIEDAD ANÓNIMA INSTITUCIÓN DE BANCA MÚLTIPLE, a través de su representante, que:<br />(a) Es una Institución de Crédito, constituida y existente conforme a las leyes de los Estados Unidos Mexicanos (“México”), según consta en la escritura número setenta y ocho mil ciento cuatro, de fecha tres de junio del año dos mil tres, otorgada ante la fe del Licenciado José Visoso del Valle, Notario Público número noventa y dos de la Ciudad de México.<br />(b) Es una Institución de Crédito, debidamente autorizada por la Secretaría de Hacienda y Crédito Público para actuar como Institución de Banca Múltiple y se encuentra facultada para celebrar el presente contrato y para asumir y dar cumplimiento a las obligaciones que en el mismo se establecen.<br />(c) Su Registro Federal de Contribuyentes es “GFI0306041K7”.<br />(d) Tiene su domicilio, para efectos de la Cláusula Vigésima Cuarta de este instrumento, en calle Ferrocarril de Cuernavaca número seiscientos ochenta y nueve, piso nueve, colonia Granada, Alcaldía Miguel Hidalgo, código postal once mil quinientos veintinueve, en la Ciudad de México.<br />(e) La suscripción, entrega y cumplimiento del presente instrumento está comprendido dentro de su objeto social, ha sido debidamente autorizado por todos los órganos corporativos correspondientes y no viola: (i) sus estatutos vigentes a la fecha de este documento; ni (ii) ley o disposición normativa o contractual alguna que le obligue o afecte.<br />(f) Explicó a las partes de este instrumento el contenido y alcance del mismo.<br />(g) Su “Aviso de Privacidad” vigente se encuentra disponible al público en general en el portal de Internet “https://covalto.com/privacidad/#info”; en la inteligencia que, el mismo podrá variar de tiempo en tiempo.<br />(h) Su representante cuenta con facultades suficientes para celebrar el presente instrumento en su nombre y representación; facultades que no le han sido revocadas, modificadas o limitadas en forma alguna a la fecha de firma de este documento.<br />(i) Con base en las declaraciones del Acreditado y del Obligado Solidario, así como en la información legal y financiera y demás información proporcionada por éstos al Acreditante, y sujeto a los términos y condiciones previstos en el presente instrumento conviene en celebrar el presente contrato.`,
        },
        {
          title: 'Declaraciones Acreditado',
          content: `II. Declaraciones del Acreditado. Declara el Acreditado que:<br />${declaracionesAcreditadoContent}`
        },
        {
          title: 'Declaraciones para ambas personas Acreditado',
          content: `
(f) Que es su voluntad celebrar el presente Contrato en su carácter de Acreditado.
(g) Que cuenta con la capacidad suficiente, con las autorizaciones correspondientes y capacidad para ejercer actos de comercio y actividades empresariales dentro del territorio nacional y su principal actividad y el domicilio en el que realiza la misma, se relacionan en el inciso II del Anexo A.
(h) A la fecha de este instrumento, sus empleados no se encuentran en huelga ni tiene conocimiento de que exista emplazamiento a huelga o que pretenda presentarse dicho emplazamiento por parte de sus trabajadores o por parte de cualquier sindicato o asociación.
(i) Ha obtenido todas las autorizaciones, licencias, permisos, aprobaciones, consentimientos y registros, necesarias para operar su negocio en relación con todas las leyes ambientales y de salubridad relacionados con sus operaciones.
(j) Tiene su domicilio, para efectos de la Cláusula Vigésima Cuarta de este instrumento, en el indicado en el inciso II del Anexo A.
(k) La información financiera y de negocios al treinta y uno de diciembre de los años ___________ y ________________, así como al día _____________ proporcionada al Acreditante, para el otorgamiento del Crédito objeto del presente Contrato, reflejan en forma correcta y completa su situación financiera en dichas fechas. Así mismo declara que no ha habido cambio alguno en su situación financiera desde la fecha de preparación de dicha información hasta la fecha del presente Contrato, que le impida cumplir con cualesquiera de las obligaciones a su cargo. La información legal y demás información proporcionada por el Acreditado al Acreditante es verdadera, correcta y vigente.
(l) Toda la documentación e información que ha entregado al Banco para el análisis y estudio del otorgamiento del Crédito es correcta y verdadera.
(m) Es su intención recibir del Acreditante el Crédito y pagar el mismo, así como sus intereses y demás accesorios, conforme a los términos y condiciones previstos en este instrumento.
(n) Destinará el importe del Crédito, única y exclusivamente para el destino que se relaciona en el inciso I del Anexo A.
(o) Por cada disposición del crédito pagará la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito con recursos de procedencia lícita.
(p) CAT. El Acreditado reconoce y acepta que para fines informativos y de comparación exclusivamente, el CAT (Costo Anual Total) del presente crédito le fue otorgado previo a la firma del presente Contrato.
(q) No existe reclamación ni disputa ni amenaza de reclamación o disputa en su contra o en contra de cualquiera de sus propiedades, ante tribunal, dependencia gubernamental o árbitro alguno, que pudiera afectar la legalidad, validez o exigibilidad de este instrumento, su condición financiera o su capacidad de pagar la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito.
(r) No se encuentra en incumplimiento legal o contractual cualquiera que pudiera afectar la legalidad, validez o exigibilidad de este instrumento, su condición financiera o su capacidad de pagar la suma principal, intereses, comisiones, gastos y demás accesorios del Crédito.
(s) El otorgamiento del presente instrumento no contraviene, ni resulta en incumplimiento de: (i) cualquier ley, reglamento, decreto o autorización (incluyendo licencias o concesiones) aplicables en su caso; o, (ii) cualquier contrato o convenio de cualquier naturaleza, respecto del cual sea parte.
(t) Se encuentra al corriente en el pago de las obligaciones legales, fiscales y contractuales a su cargo cuyo incumplimiento pudiera afectar en forma adversa su situación financiera y capacidad de pago, incluyendo, entre otras, el pago de Impuestos (como dicho término se define más adelante), las contribuciones a su cargo, pago de cuotas obrero-patronales, aportaciones al Instituto del Fondo Nacional de la Vivienda para los Trabajadores, al Sistema de Ahorro para el Retiro y/o al Instituto Mexicano del Seguro Social, de manera respectiva, y el cumplimiento de la legislación laboral aplicable en México.
(u) Que a la fecha del presente instrumento no se encuentra en procedimiento judicial o extrajudicial de insolvencia, concurso, reestructura o reorganización alguna.
(v) No requiere autorización, aprobación, registro u otro acto de, o ante, cualquier autoridad gubernamental de México o de cualquier otra jurisdicción que le sea aplicable para la suscripción, entrega y cumplimiento del presente instrumento y de cualquier otro documento o título de crédito que deba suscribir conforme al mismo.
(w) Las obligaciones que asume conforme a este instrumento y demás Documentos del Crédito constituyen obligaciones legales y válidas.
(x) Previo a la firma de este instrumento, el Acreditante puso a su disposición y le explicó inequívocamente el contenido y alcance legal de su “Aviso de Privacidad”, vigente a la fecha de firma de este instrumento, manifestando al respecto el Acreditado estar de acuerdo con el tratamiento que el Acreditante da y dará a sus datos personales en cumplimiento a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y reconociendo que dicho “Aviso de Privacidad” podrá cambiar de tiempo en tiempo y podrá ser consultado por éste en el portal de Internet del Acreditante, mismo que, al momento de la firma, consultó en el siguiente enlace “https://covalto.com/privacidad/#info”.
(y) Conoce la situación sanitaria y económica derivada de la pandemia “COVID-19”, por lo que desarrolló e implementó una estrategia general de negocio conducente. En este sentido, no podrá alegar caso fortuito o fuerza mayor derivada de la situación sanitaria antes mencionada -o sus efectos o consecuencias- para incumplir a las obligaciones contraídas al amparo del Contrato de Crédito, de conformidad con lo dispuesto en la Cláusula Vigésima Quinta.
(z) Previo a la firma del presente Contrato, el Acreditado realizó la gestión necesaria para dar de alta su firma electrónica avanzada consistente en el conjunto de datos y caracteres que permite la identificación del firmante, que ha sido creada por medios electrónicos bajo su exclusivo control, de manera que está vinculada únicamente al mismo y a los datos a los que se refiere, lo que permite que sea detectable cualquier modificación ulterior de éstos, la cual produce los mismos efectos jurídicos que la firma autógrafa (la “FIEL”) misma que se podrá utilizar, en este contrato como su firma electrónica, que consiste en los datos en forma electrónica consignados en un mensaje de datos, o adjuntados o lógicamente asociados al mismo, que son utilizados para identificar al firmante en relación con el Mensaje de Datos e indicar que el firmante aprueba la información contenida en el mensaje de datos, y que produce los mismos efectos jurídicos que la firma autógrafa, siendo inclusive admisible como prueba en juicio (la “Firma Electrónica”) para la formalización del presente Contrato, la Solicitud de Disposición del Crédito, el Pagaré y demás Documentos del Crédito. Es uno de los motivos determinantes de la voluntad de las Partes reconocer que el presente Contrato se podrá celebrar mediante Firma Electrónica y que en dado caso tendrá la misma validez y eficacia como si hubiese sido celebrado con firma autógrafa.
(aa) Tiene pleno conocimiento del alcance, forma de uso y características de una Firma Electrónica. Adicionalmente y de manera personal realizó todas las gestiones para dar de alta su firma electrónica avanzada y es el único usuario y responsable de la misma, por lo que no podrá alegar mal uso de esta por un tercero y por consecuencia no podrá, sin incurrir en responsabilidad penal, negar la firma del presente Contrato y/o cualquier Anexo.`
        },
        {
          title: 'Declaraciones Obligado Solidario',
          content: `III. Declaraciones del Obligado Solidario. Declara el Obligado Solidario, que:<br />${declaracionesObligadoSolidarioContent}`
        },
        {
          title: 'Declaraciones para ambas personas Obligado Solidario',
          content: declaracionesAmbasPersonasObligadoSolidario,
        },
        {
          title: 'Declaraciones de las Partes',
          content: `IV. Declaraciones de las Partes. Declaran las partes de este instrumento que:<br />(a) Se reconocen recíprocamente la personalidad con la que se ostentan.<br />(b) Negociaron libre y voluntariamente el contenido de este instrumento, haciéndose concesiones recíprocas.<br />(c) Reconocen inequívocamente la equivalencia funcional de la Firma Electrónica con la firma autógrafa, por lo que reconocen asimismo la validez y obligatoriedad del presente Contrato, la forma en la que expresaron su consentimiento, y las obligaciones que derivan del mismo-<br />(d) Es su deseo celebrar el presente instrumento y sujetarse a las Cláusulas que enseguida se contienen, mismas que acordaron libre y voluntariamente.`
        },
        {
          title: 'Titulo cláusulas',
          content: `-------------------------------------------------- C L Á U S U L A S <br />---------DEL CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA`,
        },
        {
          title: 'Seccion 1-  Primera clausula',
          content: `PRIMERA. Definiciones e Interpretación.<br />1.1 (uno punto uno) 	Los términos en mayúscula inicial utilizados en el presente instrumento, que no constituyan nombres propios, ni se refieran a capítulos, apartados, secciones o cláusulas de este u otro documento, tendrán el siguiente significado:<br />“Accionistas”: Son las personas relacionadas en el inciso II del Anexo A, y manifiesta el Acreditado a través de su representante, que a la fecha del presente, son los propietarios de la totalidad de las acciones con derecho a voto del capital social del Acreditado, de conformidad con la escritura que se relaciona en el inciso II del Anexo A.<br />“Acreditado”: Tiene el significado que se le atribuye en el Proemio.<br />“Acreditante”: Tiene el significado que se le atribuye en el Proemio.<br />“Aseguradora”: Significa la institución de seguros o cualquier otra entidad financiera debidamente autorizada para organizarse y operar contratos de seguro en el ramo de vida.<br />“Autoridad Gubernamental”: Significa cualquier cuerpo o ente gubernamental o regulatorio, así como cualquier subdivisión política del mismo, de cualquier país, ya sea federal, estatal o municipal, o cualquier agencia o departamento de los mismos, cualquier corte arbitral (pública o privada) de cualquier jurisdicción en la cual una Persona mantenga operaciones.<br />“Aviso de Vencimiento Anticipado”: Tiene el significado que se le atribuye en la Sección 14.3 (catorce punto tres).<br />“Banco”: Tiene el significado que se le atribuye en la Declaración I.<br />“Beneficio por Reciprocidad”: Disminución de un punto porcentual sobre la Tasa Ordinaria inicial autorizada por el Banco, previo cumplimiento de las Condiciones de Reciprocidad.<br />“Buró de Crédito”: Tiene el significado que se le atribuye en la Sección 18.1 (dieciocho punto uno).<br />“Cambio de Control”: Significa, en cualquier momento, que los Accionistas, directa o indirectamente, dejen de ser los propietarios del 51% (cincuenta y uno por ciento) del capital social en circulación del Acreditado y de cuando menos el 51% (cincuenta y uno por ciento) de las acciones con derecho a voto en circulación del Acreditado.<br />“CAT”: 	Significa, el costo anual total de financiamiento expresado en términos porcentuales anuales que, para fines informativos y de comparación, incorpora la totalidad de los costos y gastos inherentes a los créditos.<br />“Causa de Vencimiento Anticipado”: Tiene el significado que se le atribuye en la Sección 14.3 (catorce punto tres).`,
        },
        {
          title: 'Clientes del Acreditado – Primera clausula',
          content: `“Clientes del Acreditado”: Significan ___________________.`,
        },
        {
          title: 'Seccion 2 - Primera clausula',
          content: `“Condiciones de Disposición”: Tiene el significado que se le atribuye en la Sección 3.2 (tres punto dos).<br />“Condiciones de Reciprocidad”: Saldo igual o mayor al 10% (diez por ciento) del monto del Crédito.<br />“Contrato de Crédito”: Tiene el significado que se le atribuye en el Proemio.<br />“Crédito”: Tiene el significado que se le atribuye en la Sección 2.1 (dos punto uno).<br />“Cuenta Vinculada”: Tiene la definición que se la atribuye a dicho término en la Cláusula Tercera del presente Contrato.<br />“Destino del Crédito”: Tiene el significado que se le atribuye en el inciso I del Anexo A.<br />“Deuda”: Significa, respecto de cualquier persona (i) todas las obligaciones derivadas de dinero tomado en crédito y/o crédito, (ii) todas las obligaciones documentadas en bonos, pagarés o instrumentos similares, independientemente de su denominación y de la legislación que las rija, y (iii) toda la deuda de terceros respecto de la cual dicha persona otorgue garantía, fianza, hipoteca, aval o asuma obligación solidaria.<br />“Día Hábil”: Tiene el significado que se le atribuye en la Sección 5.2 (cinco punto dos) (a).<br />“Disposición”: 	Tiene el significado que se le atribuye a dicho término en la Cláusula Tercera de este Contrato de Crédito.<br />“Documentos del Crédito”: Significa, conjuntamente, el Contrato de Crédito, la Solicitud de Disposición del Crédito y cualquier otro título de crédito que consigne una obligación de pago a cargo del Acreditado y/o del Obligado Solidario a favor del Acreditante y, en general, cualquier otro instrumento, documento o título relacionado con el Crédito.<br />“Efecto Material Adverso”: 	Significa, una consecuencia negativa y significativa sobre: (i) el negocio del Acreditado; (ii) la condición financiera del Acreditado y/o su capacidad de pagar el Crédito; o (iii) la validez y exigibilidad de cualquiera de los Documentos del Crédito.<br />“Fecha de Vencimiento Anticipado”: Tiene el significado que se le atribuye en la Sección 5.2 (cinco punto dos) (b).<br />“FIRA”: Fideicomisos Instituidos en Relación con la Agricultura.<br />“Formato de Solicitud de Disposición del Crédito”: Tiene el significado que se le atribuye en la Sección 3.2 (tres punto dos) (ii) (a).<br />“Impuestos”: Significará todas aquellas contribuciones, imposiciones o gravámenes fiscales incluyendo, sin limitación, recargos, sanciones, gastos de ejecución e indemnizaciones y cualquier otro accesorio, en términos de las disposiciones fiscales aplicables.<br />“IVA”: Significa, el Impuesto al Valor Agregado.<br />“LGTOC”: Significa la Ley General de Títulos y Operaciones de Crédito.<br />“México”: Significa Estados Unidos Mexicanos.`,
        },
        {
          title: 'Notificación a los Clientes del Acreditado respecto del cambio de cuenta – Primera clausula',
          content: `“Notificación a los Clientes del Acreditado respecto del cambio de cuenta”: Significa el documento mediante el cual el Acreditado notifique a sus Clientes que, a partir de esa fecha, únicamente cumplirán con sus obligaciones de pago para con el Acreditado en la Cuenta Vinculada, haciéndoles saber el número de la CLABE y cuenta de pago, referidas en el inciso I del Anexo A.`,
        },
        {
          title: 'Seccion 3 - Primera clausula',
          content: `“Obligaciones Garantizadas”: Significa la obligación del pago exacto de la suma principal insoluta de cada disposición del crédito, intereses aun en exceso de los que se devenguen en un término de 3 (tres) años, comisiones, gastos y demás accesorios del Crédito y demás pagos que deba hacer el Acreditado al Acreditante conforme al Contrato de Crédito, la Solicitud de Disposición del Crédito, el o los Pagarés y demás Documentos del Crédito.<br />“Obligado Solidario”: Tiene el significado que se le atribuye en el Proemio.<br />“Pagaré”: Significa el o los títulos de crédito ejecutivos que, en la Fecha de Firma, o posteriormente, suscriba el Acreditado y el Aval en consonancia con los requisitos que refiere el artículo 170 (ciento setenta) de la LGTOC con la finalidad de documentar el Crédito y/o cada una de las Disposiciones, en su caso.<br />“Pena Convencional”: Tiene el significado que se le atribuye en la Cláusula Décima Cuarta.<br />“Persona Asegurada”: Tiene el significado que se le atribuye en el inciso I del Anexo A.<br />“Pesos”: Significa la moneda de curso legal en México.<br />"Tabla de Vencimientos”: Significa las fechas vencimiento en las que serán exigibles los pagos de capital e intereses y demás accesorios del Crédito de conformidad con lo establecido en la Solicitud de Disposición del Crédito, documento que formará parte integrante de la misma, según se establece en la sección 5.2 (cinco punto dos) (b) del presente instrumento.<br />“Tasa Ordinaria”: Tiene el significado que se le atribuye en la Sección 5.1 (cinco punto uno).<br />“Vigencia del Crédito”: Tiene el significado que se le atribuye en el inciso I del Anexo A.<br />1.2 (uno punto dos) Las siguientes reglas de interpretación aplican a este instrumento:<br />1.3 (uno punto tres) 	Cualquier documento al que se haga referencia en este instrumento significa dicho documento, según sea eventualmente modificado, adicionado o reemplazado e incluye todos los anexos del mismo.<br />1.4 (uno punto cuatro) 	Cualquier ley, reglamento, disposición o circular a la que se haga referencia en este instrumento significa dicha ley, reglamento, disposición o circular, según la misma sea eventualmente modificada, reformada, adicionada o reemplazada.<br />1.5 (uno punto cinco) Todos los términos definidos en este instrumento pueden ser aplicados en singular o plural.`,
        },
      ];

      return cells.map((cell, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        title: cell.title,
        content: cell.content.trim().replace(/\n/g, '<br />'),
        visible: true,
      }));
    }
  },
];

    

    