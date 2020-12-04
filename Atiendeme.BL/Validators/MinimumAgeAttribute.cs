using System;
using System.ComponentModel.DataAnnotations;

namespace Atiendeme.BL.Validators
{
    public class MinimumAgeAttribute : ValidationAttribute
    {
        private int _minimumAge { get; }

        public MinimumAgeAttribute(int minimumAge)
        {
            _minimumAge = minimumAge;
            ErrorMessage = "Debe de tener mas de 18 años.";
        }

        public override bool IsValid(object value)
        {
            DateTime date;
            if (DateTime.TryParse(value.ToString(), out date))
            {
                return date.AddYears(_minimumAge) < DateTime.Now;
            }

            return false;
        }

        public override string FormatErrorMessage(string name)
        {
            return string.Format(ErrorMessageString, name, _minimumAge);
        }
    }
}