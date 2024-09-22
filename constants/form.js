export const REQUIRED_MESSAGE = "заполни поле";
export const FORMAT_MESSAGE = "неправильный формат";
const SPACE_MESSAGE = `Поле "Пароль" не может содержать пробел`;
const MIN_LENGTH = "Минимальная длина 6 символов";
const PASSWORD_REPEAT = "Введенные пароли не совпадают";
const PHONE = "Номер телефона введён некорректно";

/**
 * @param {string|{message}} name
 * @return {{required: *}}
 */
export function required(name) {
  return {
    required: name?.message || REQUIRED_MESSAGE
  }
}

export function checkPhone() {
  return {
    validate(val) {
      if (/[a-zA-Zа-яА-Я]+/.test(val) || val.match(/\d/g)?.join("").length !== 11)
        return PHONE;
      return true
    }
  }
}

export function email(name) {
  return {
    ...required(name),
    pattern: {
      value: /.+@.+\..+/,
      message: FORMAT_MESSAGE
    },
  }
}

export function password(getValue) {
  return {
    validate(val) {
      if (!val) {
        return REQUIRED_MESSAGE
      }
      if (/\s/.test(val)) {
        return SPACE_MESSAGE;
      }
      if (val.length < 6) {
        return MIN_LENGTH;
      }
      if (getValue && getValue() !== val) {
        return PASSWORD_REPEAT;
      }

      return true;
    }
  }
}

export function birthDate() {
  const minYears = 18;
  const maxYears = 120;

  return {
    /**
     *
     * @param val - "28.11.2023"
     * @returns {string|boolean}
     */
    validate(val) {
      if (!val)
        return REQUIRED_MESSAGE;
      const [day, month, year] = val.split(".");
      let dateObj = new Date(`${year}/${month}/${day}`);

      function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
      }

      if (!isValidDate(dateObj)) return "Введите корректную дату";

      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - minYears);

      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - maxYears);

      const isYounger = dateObj - minDate > 0;
      const isOlder = maxDate - dateObj > 0;

      if (!isYounger && !isOlder) return true;

      return `Проверьте год рождения: ваш возраст может быть в дапазоне с ${minYears} до ${maxYears} лет`;
    }
  }
}
